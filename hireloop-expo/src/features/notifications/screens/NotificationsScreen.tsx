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

import {toAppApiError} from '../../../core/api/api-error';
import {goBackOrReplace} from '../../../core/navigation/go-back-or-replace';
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

export function NotificationRow({item, onPress}: {item: CandidateNotification; onPress: () => void}) {
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
        <View style={styles.notificationMetaRow}>
          <View style={[styles.notificationBadge, {backgroundColor: presentation.background}]}>
            <Text numberOfLines={1} style={[styles.notificationBadgeText, {color: presentation.color}]}>{presentation.label}</Text>
          </View>
          <Text style={styles.metaSeparator}>{'\u2022'}</Text>
          <Text style={styles.notificationTime}>{formatNotificationTime(item.createdAt)}</Text>
          {!item.isRead && <View accessibilityLabel="Belum dibaca" style={styles.unreadDot} />}
        </View>
        <Text style={[styles.notificationTitle, !item.isRead && styles.unreadTitle]}>{item.title}</Text>
        <Text style={styles.notificationBody}>{item.body}</Text>
        {destination && (
          <View style={styles.notificationActionArea}>
            <Text style={styles.notificationActionText}>Lihat Detail</Text>
            <Ionicons name="chevron-forward" size={18} color="#1267E8" />
          </View>
        )}
      </View>
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
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
  const containerWidth = measuredWidth ?? Math.min(viewportWidth, 440);
  const pagePadding = containerWidth <= 350 ? 14 : 18;
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
    <View
      style={[styles.header, {paddingHorizontal: pagePadding, paddingTop: insets.top + 8}]}
      testID="notifications-header"
    >
      <View style={styles.titleRow}>
        <Pressable
          accessibilityLabel="Kembali ke Beranda"
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => goBackOrReplace('/(candidate)/(tabs)/home')}
          style={styles.headerIconButton}
        >
          <Ionicons name="arrow-back" size={27} color="#061A4D" />
        </Pressable>
        <Text style={styles.headerTitle}>Notifikasi</Text>
        <View accessibilityLabel={`${notifications.unreadCount} notifikasi belum dibaca`} style={styles.headerBell}>
          <Ionicons name="notifications-outline" size={28} color="#061A4D" />
          {notifications.unreadCount > 0 && <View style={styles.headerUnreadDot} />}
        </View>
      </View>

      <View style={styles.controlsRow} testID="notifications-filter-row">
        <View accessibilityRole="tablist" style={styles.filters}>
          {(['all', 'unread'] as const).map(value => {
            const selected = filter === value;
            const label = value === 'all'
              ? 'Semua'
              : `Belum Dibaca${notifications.unreadCount ? ` (${notifications.unreadCount})` : ''}`;
            return (
              <Pressable
                key={value}
                accessibilityRole="tab"
                accessibilityState={{selected}}
                onPress={() => setFilter(value)}
                style={[styles.filterPill, value === 'unread' && styles.unreadFilterPill, selected && styles.filterPillSelected]}
                testID={`notification-filter-${value}`}
              >
                <Text numberOfLines={1} style={[styles.filterText, selected && styles.filterTextSelected]}>{label}</Text>
              </Pressable>
            );
          })}
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
            ? <ActivityIndicator size="small" color="#1267E8" />
            : <Ionicons name="checkmark-done" size={18} color="#1267E8" />}
          <Text numberOfLines={1} style={styles.markAllText}>Tandai dibaca</Text>
        </Pressable>
      </View>
    </View>
  );

  const initialError = notifications.isError && notifications.items.length === 0;

  return (
    <View style={styles.outer}>
      <StatusBar style="dark" />
      <View
        onLayout={event => {
          const nextWidth = Math.round(event.nativeEvent.layout.width);
          if (nextWidth > 0) setMeasuredWidth(current => current === nextWidth ? current : nextWidth);
        }}
        style={styles.screen}
        testID="notifications-screen"
      >
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
            renderItem={({item}) => (
              <View style={{paddingHorizontal: pagePadding}}>
                <NotificationRow item={item} onPress={() => openNotification(item)} />
              </View>
            )}
            renderSectionHeader={({section}) => (
              <View style={[styles.sectionHeader, {paddingHorizontal: pagePadding}]}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
            )}
            ListEmptyComponent={<View style={styles.emptyWrapper}><EmptyState filter={filter} /></View>}
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
  screen: {flex: 1, width: '100%', maxWidth: 440, backgroundColor: '#F7F9FC'},
  header: {zIndex: 2, flexShrink: 0, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E8EDF5', paddingBottom: 16},
  titleRow: {minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 10},
  headerIconButton: {width: 42, height: 44, alignItems: 'center', justifyContent: 'center', flexShrink: 0},
  headerTitle: {flex: 1, minWidth: 0, fontFamily: F.bold, fontSize: 26, lineHeight: 34, color: '#061A4D'},
  headerBell: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center', flexShrink: 0},
  headerUnreadDot: {position: 'absolute', top: 7, right: 7, width: 9, height: 9, borderRadius: 5, borderWidth: 1.5, borderColor: 'white', backgroundColor: '#1267E8'},
  controlsRow: {width: '100%', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10, paddingTop: 12},
  markAllButton: {minHeight: 40, flexShrink: 0, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 5, marginLeft: 'auto'},
  markAllDisabled: {opacity: 0.48},
  markAllText: {fontFamily: F.bold, fontSize: 11, lineHeight: 16, color: '#1267E8'},
  listContent: {paddingBottom: 26, flexGrow: 1},
  filters: {flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: 8},
  filterPill: {minWidth: 92, minHeight: 42, borderRadius: 22, borderWidth: 1, borderColor: '#D5DDE9', backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20},
  unreadFilterPill: {minWidth: 134},
  filterPillSelected: {borderColor: '#062A70', backgroundColor: '#062A70'},
  filterText: {fontFamily: F.bold, fontSize: 11.5, color: '#283A5C'},
  filterTextSelected: {color: 'white'},
  sectionHeader: {backgroundColor: '#F7F9FC', paddingTop: 18, paddingBottom: 9},
  sectionTitle: {fontFamily: F.bold, fontSize: 13, lineHeight: 19, color: '#6E7A90'},
  notificationRow: {...cardShadow, minHeight: 148, borderWidth: 1, borderColor: '#E7ECF3', borderRadius: 15, backgroundColor: 'white', flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 15, paddingVertical: 17, marginBottom: 12},
  unreadRow: {borderColor: '#C9DCFF', backgroundColor: '#F4F8FF'},
  notificationIcon: {width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1},
  notificationCopy: {flex: 1, minWidth: 0},
  notificationMetaRow: {minHeight: 30, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 7, rowGap: 5},
  notificationBadge: {maxWidth: '58%', minHeight: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 11},
  notificationBadgeText: {fontFamily: F.bold, fontSize: 10.5, lineHeight: 15},
  metaSeparator: {fontFamily: F.bold, fontSize: 11, lineHeight: 17, color: '#7D899E'},
  notificationTitle: {fontFamily: F.semibold, fontSize: 13.5, lineHeight: 21, color: '#28344D', marginTop: 10},
  unreadTitle: {fontFamily: F.bold, color: '#071A45'},
  unreadDot: {width: 8, height: 8, borderRadius: 4, backgroundColor: '#1267E8', marginLeft: 'auto'},
  notificationBody: {fontFamily: F.regular, fontSize: 11.5, lineHeight: 18, color: '#59657A', marginTop: 6},
  notificationTime: {flexShrink: 1, fontFamily: F.medium, fontSize: 10, lineHeight: 16, color: '#7D899E'},
  notificationActionArea: {minHeight: 42, borderTopWidth: 1, borderTopColor: '#E6EBF2', flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 14, paddingTop: 12},
  notificationActionText: {fontFamily: F.bold, fontSize: 12, lineHeight: 18, color: '#1267E8'},
  pressed: {opacity: 0.72},
  centerState: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36},
  loadingText: {fontFamily: F.regular, fontSize: 11, color: '#667085', marginTop: 11},
  emptyWrapper: {flex: 1, paddingHorizontal: 18},
  emptyState: {flex: 1, minHeight: 330, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 26},
  emptyIcon: {width: 64, height: 64, borderRadius: 32, backgroundColor: '#EAF0F9', alignItems: 'center', justifyContent: 'center'},
  emptyTitle: {fontFamily: F.bold, fontSize: 16, lineHeight: 22, color: '#14203A', textAlign: 'center', marginTop: 15},
  emptyText: {fontFamily: F.regular, fontSize: 11, lineHeight: 18, color: '#6B7587', textAlign: 'center', marginTop: 6},
  retryButton: {minHeight: 42, borderRadius: 10, backgroundColor: '#1267E8', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22, marginTop: 17},
  retryText: {fontFamily: F.bold, fontSize: 10.5, color: 'white'},
  footerLoader: {paddingVertical: 17},
});
