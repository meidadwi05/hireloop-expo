import Ionicons from '@expo/vector-icons/Ionicons';
import {router} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {BrandedHeaderBackground} from '../../../components/ui/BrandedHeaderBackground';
import {toAppApiError} from '../../../core/api/api-error';
import {useNotifications} from '../hooks/use-notifications';
import {resolveNotificationDestination} from '../notifications.navigation';
import type {CandidateNotification} from '../notifications.types';
import {
  formatNotificationTime,
  groupNotifications,
  NOTIFICATION_FONTS as F,
  notificationPresentation,
} from '../notifications.ui';

type NotificationFilter = 'all' | 'unread';

function NotificationRow({item, onPress}: {item: CandidateNotification; onPress: () => void}) {
  const presentation = notificationPresentation(item);
  const destination = resolveNotificationDestination(item);

  return (
    <Pressable
      accessibilityHint={destination ? 'Membuka detail terkait' : 'Menandai notifikasi sebagai dibaca'}
      accessibilityLabel={`${item.isRead ? '' : 'Belum dibaca. '}${item.title}. ${item.body}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [styles.notificationRow, !item.isRead && styles.unreadRow, pressed && styles.pressed]}
      testID={`notification-${item.id}`}
    >
      <View style={[styles.notificationIcon, {backgroundColor: presentation.background}]}>
        <Ionicons name={presentation.icon} size={22} color={presentation.color} />
      </View>
      <View style={styles.notificationCopy}>
        <View style={styles.notificationTopline}>
          <Text numberOfLines={2} style={[styles.notificationTitle, !item.isRead && styles.unreadTitle]}>{item.title}</Text>
          {!item.isRead && <View accessibilityLabel="Belum dibaca" style={styles.unreadDot} />}
        </View>
        <Text numberOfLines={3} style={styles.notificationBody}>{item.body}</Text>
        <Text style={styles.notificationTime}>{formatNotificationTime(item.createdAt)}</Text>
      </View>
      {destination && <Ionicons name="chevron-forward" size={17} color="#A4ADBD" />}
    </Pressable>
  );
}

function EmptyState({filter}: {filter: NotificationFilter}) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}><Ionicons name="notifications-off-outline" size={31} color="#5F78A5" /></View>
      <Text style={styles.emptyTitle}>{filter === 'unread' ? 'Semua sudah dibaca' : 'Belum ada notifikasi'}</Text>
      <Text style={styles.emptyText}>
        {filter === 'unread'
          ? 'Tidak ada notifikasi baru yang perlu Anda periksa.'
          : 'Informasi lamaran dan proses rekrutmen akan muncul di sini.'}
      </Text>
    </View>
  );
}

export function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const {width: viewportWidth} = useWindowDimensions();
  const containerWidth = Math.min(viewportWidth, 720);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const notifications = useNotifications();
  const visibleItems = useMemo(
    () => filter === 'unread' ? notifications.items.filter(item => !item.isRead) : notifications.items,
    [filter, notifications.items],
  );
  const sections = useMemo(() => groupNotifications(visibleItems), [visibleItems]);

  useEffect(() => {
    if (!notifications.mutationError) return;
    Alert.alert('Perubahan belum tersimpan', 'Periksa koneksi Anda lalu coba lagi.');
  }, [notifications.mutationError]);

  const openNotification = (item: CandidateNotification) => {
    if (!item.isRead) notifications.markRead(item.id);
    const destination = resolveNotificationDestination(item);
    if (destination) router.push(destination as never);
  };

  const header = (
    <BrandedHeaderBackground
      artworkTestID="notifications-header-artwork"
      containerWidth={containerWidth}
      style={[styles.header, {paddingTop: insets.top + 13}]}
      testID="notifications-header"
      topInset={insets.top}
      variant="notifications"
    >
      <View style={styles.headerTopline}>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Notifikasi</Text>
          <Text style={styles.headerSubtitle}>
            {notifications.unreadCount > 0
              ? `${notifications.unreadCount} pemberitahuan belum dibaca`
              : 'Semua pemberitahuan sudah dibaca'}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{disabled: notifications.unreadCount === 0 || notifications.markingAllRead}}
          disabled={notifications.unreadCount === 0 || notifications.markingAllRead}
          onPress={() => notifications.markAllRead()}
          style={({pressed}) => [
            styles.markAllButton,
            notifications.unreadCount === 0 && styles.markAllDisabled,
            pressed && styles.pressed,
          ]}
        >
          {notifications.markingAllRead
            ? <ActivityIndicator size="small" color="white" />
            : <Ionicons name="checkmark-done" size={17} color="white" />}
          <Text style={styles.markAllText}>Tandai semua</Text>
        </Pressable>
      </View>
    </BrandedHeaderBackground>
  );

  const listHeader = (
    <View style={styles.filters}>
      {(['all', 'unread'] as const).map(value => {
        const selected = filter === value;
        const label = value === 'all' ? 'Semua' : `Belum dibaca${notifications.unreadCount ? ` (${notifications.unreadCount})` : ''}`;
        return (
          <Pressable
            key={value}
            accessibilityRole="tab"
            accessibilityState={{selected}}
            onPress={() => setFilter(value)}
            style={[styles.filterPill, selected && styles.filterPillSelected]}
          >
            <Text style={[styles.filterText, selected && styles.filterTextSelected]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  const initialError = notifications.isError && notifications.items.length === 0;

  return (
    <View style={styles.outer}>
      <StatusBar style="light" />
      <View style={[styles.screen, {width: containerWidth}]}>
        {header}
        {notifications.isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#1267E8" />
            <Text style={styles.loadingText}>Memuat notifikasi...</Text>
          </View>
        ) : initialError ? (
          <View style={styles.centerState}>
            <View style={styles.emptyIcon}><Ionicons name="cloud-offline-outline" size={31} color="#B45F06" /></View>
            <Text style={styles.emptyTitle}>Notifikasi belum dapat dimuat</Text>
            <Text style={styles.emptyText}>{toAppApiError(notifications.error).message}</Text>
            <Pressable accessibilityRole="button" onPress={() => void notifications.refresh()} style={styles.retryButton}>
              <Text style={styles.retryText}>Coba lagi</Text>
            </Pressable>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={item => item.id}
            renderItem={({item}) => <NotificationRow item={item} onPress={() => openNotification(item)} />}
            renderSectionHeader={({section}) => <Text style={styles.sectionTitle}>{section.title}</Text>}
            ListHeaderComponent={listHeader}
            ListEmptyComponent={<EmptyState filter={filter} />}
            ListFooterComponent={notifications.isFetchingNextPage ? <ActivityIndicator color="#1267E8" style={styles.footerLoader} /> : null}
            contentContainerStyle={styles.listContent}
            onEndReached={() => {
              if (notifications.hasNextPage && !notifications.isFetchingNextPage) void notifications.fetchNextPage();
            }}
            onEndReachedThreshold={0.35}
            refreshControl={
              <RefreshControl
                refreshing={notifications.isRefetching && !notifications.isFetchingNextPage}
                onRefresh={() => void notifications.refresh()}
                tintColor="#1267E8"
                colors={['#1267E8']}
              />
            }
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
          />
        )}
      </View>
    </View>
  );
}

const cardShadow = {
  shadowColor: '#193A70',
  shadowOffset: {width: 0, height: 3},
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 2,
};

const styles = StyleSheet.create({
  outer: {flex: 1, backgroundColor: '#EEF3FA', alignItems: 'center'},
  screen: {flex: 1, maxWidth: 720, backgroundColor: '#F7F9FC'},
  header: {paddingHorizontal: 20},
  headerTopline: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12},
  headerCopy: {flex: 1, minWidth: 0},
  headerTitle: {fontFamily: F.bold, fontSize: 24, lineHeight: 31, color: 'white'},
  headerSubtitle: {fontFamily: F.regular, fontSize: 11, lineHeight: 16, color: 'rgba(255,255,255,0.86)', marginTop: 3},
  markAllButton: {minHeight: 38, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.42)', backgroundColor: 'rgba(0,27,92,0.25)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 11},
  markAllDisabled: {opacity: 0.48},
  markAllText: {fontFamily: F.semibold, fontSize: 9.5, color: 'white'},
  listContent: {paddingHorizontal: 18, paddingBottom: 26, flexGrow: 1},
  filters: {flexDirection: 'row', alignItems: 'center', gap: 9, paddingTop: 18, paddingBottom: 17},
  filterPill: {minHeight: 37, borderRadius: 19, borderWidth: 1, borderColor: '#DCE4F0', backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 17},
  filterPillSelected: {borderColor: '#1267E8', backgroundColor: '#1267E8'},
  filterText: {fontFamily: F.semibold, fontSize: 10.5, color: '#5B6679'},
  filterTextSelected: {color: 'white'},
  sectionTitle: {fontFamily: F.bold, fontSize: 12.5, color: '#16213B', marginBottom: 9, marginTop: 7},
  notificationRow: {...cardShadow, minHeight: 112, borderWidth: 1, borderColor: '#E7ECF3', borderRadius: 15, backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 13, paddingVertical: 14, marginBottom: 10},
  unreadRow: {borderColor: '#C9DCFF', backgroundColor: '#F4F8FF'},
  notificationIcon: {width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', flexShrink: 0},
  notificationCopy: {flex: 1, minWidth: 0},
  notificationTopline: {flexDirection: 'row', alignItems: 'flex-start', gap: 7},
  notificationTitle: {flex: 1, fontFamily: F.semibold, fontSize: 12.5, lineHeight: 17, color: '#28344D'},
  unreadTitle: {fontFamily: F.bold, color: '#071A45'},
  unreadDot: {width: 8, height: 8, borderRadius: 4, backgroundColor: '#1267E8', marginTop: 4},
  notificationBody: {fontFamily: F.regular, fontSize: 10.5, lineHeight: 16, color: '#59657A', marginTop: 4},
  notificationTime: {fontFamily: F.medium, fontSize: 9, color: '#8A95A8', marginTop: 7},
  pressed: {opacity: 0.72},
  centerState: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36},
  loadingText: {fontFamily: F.regular, fontSize: 11, color: '#667085', marginTop: 11},
  emptyState: {flex: 1, minHeight: 330, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 26},
  emptyIcon: {width: 64, height: 64, borderRadius: 32, backgroundColor: '#EAF0F9', alignItems: 'center', justifyContent: 'center'},
  emptyTitle: {fontFamily: F.bold, fontSize: 16, lineHeight: 22, color: '#14203A', textAlign: 'center', marginTop: 15},
  emptyText: {fontFamily: F.regular, fontSize: 11, lineHeight: 18, color: '#6B7587', textAlign: 'center', marginTop: 6},
  retryButton: {minHeight: 42, borderRadius: 10, backgroundColor: '#1267E8', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22, marginTop: 17},
  retryText: {fontFamily: F.bold, fontSize: 10.5, color: 'white'},
  footerLoader: {paddingVertical: 17},
});
