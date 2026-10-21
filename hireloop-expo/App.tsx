import React, {useEffect, useState} from 'react';



import {BackHandler, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Image, ActivityIndicator} from 'react-native';



import {StatusBar} from 'expo-status-bar';



import {LinearGradient} from 'expo-linear-gradient';



import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';



import {Ionicons} from '@expo/vector-icons';

import MaskedView from '@react-native-masked-view/masked-view';

import {useFonts} from 'expo-font';
import axios from 'axios';

import {

  PlusJakartaSans_400Regular,

  PlusJakartaSans_500Medium,

  PlusJakartaSans_600SemiBold,

  PlusJakartaSans_700Bold,

  PlusJakartaSans_800ExtraBold,

} from '@expo-google-fonts/plus-jakarta-sans';
import LoginPage from './src/login_page/login';
import ForgotPasswordPage from './src/login_page/forgotpassword';
import {candidateApi, CandidateUser} from './src/api/candidateApi';
import DashboardHome from './src/dashboard/DashboardHome';



const F = {

  regular: 'PlusJakartaSans_400Regular',

  medium: 'PlusJakartaSans_500Medium',

  semibold: 'PlusJakartaSans_600SemiBold',

  bold: 'PlusJakartaSans_700Bold',

  extrabold: 'PlusJakartaSans_800ExtraBold',

} as const;





type Screen = 'splash'|'onboarding'|'login'|'forgot'|'demo'|'dashboard'|'register'|'registerSuccess'|'verify'|'verifySuccess'|'profile';



const C = {navy:'#050D49', blue:'#0865FF', cyan:'#00CBEA', ink:'#12224B', muted:'#7B869D'};



const slides = [



  {title:'Lamar kerja lebih\ncepat & tepat sasaran', body:'Cari lowongan dari berbagai perusahaan terpercaya sesuai dengan minat dan keahlianmu.'},



  {title:'Pantau Proses Lamaran\nSecara Real-Time', body:'Dapatkan update setiap tahap seleksi lamaran pekerjaan langsung di genggaman.'},



  {title:'Lamar ke Banyak\nPerusahaan Sekaligus', body:'Kirim lamaran ke berbagai perusahaan dan pantau semuanya dalam satu aplikasi terpercaya.'},



  {title:'Temukan Pekerjaan\nyang Tepat', body:'Sistem kami akan merekomendasikan pekerjaan terbaik berdasarkan profil dan aktivitasmu.'},



];



function Logo() {
  return (
    <Image
      source={require('./src/assets/HireLoopLogo.png')}
      style={s.splashLogoImage}
      resizeMode="contain"
      accessibilityLabel="Logo HireLoop"
    />
  );
}



function Button({label,onPress,loading=false}:{label:string;onPress:()=>void;loading?:boolean}) {return <Pressable accessibilityRole="button" accessibilityState={{disabled:loading,busy:loading}} disabled={loading} onPress={onPress} style={({pressed})=>[s.button,pressed&&{opacity:.82}]}><LinearGradient colors={[C.blue,C.cyan]} start={{x:0,y:0}} end={{x:1,y:0}} style={s.buttonInner}>{loading?<ActivityIndicator color="white"/>:<><Text style={s.buttonText}>{label}</Text><Ionicons name="arrow-forward" size={19} color="white"/></>}</LinearGradient></Pressable>;}



function Link({label,onPress,light=false}:{label:string;onPress:()=>void;light?:boolean}) {return <Pressable accessibilityRole="button" onPress={onPress} hitSlop={8} style={s.link}><Text style={{fontFamily:F.regular,color:light?'#C7D5FF':C.blue,fontSize:12,fontWeight:'600'}}>{label}</Text></Pressable>;}



const validEmail = (v:string)=> /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());



function GradientHeading({text, dark}:{text:string;dark:boolean}) {
  if (dark) {
    return <Text style={[s.heading, {color:'white'}]}>{text}</Text>;
  }
  return (
    <MaskedView
      style={{alignSelf:'stretch'}}
      maskElement={
        <View style={{backgroundColor:'transparent'}}>
          <Text style={s.heading}>{text}</Text>
        </View>
      }
    >
      <LinearGradient
        colors={['#0051FD', '#00DAFD']}
        start={{x:0, y:0.5}}
        end={{x:1, y:0.5}}
      >
        <Text style={[s.heading, {opacity:0}]}>{text}</Text>
      </LinearGradient>
    </MaskedView>
  );
}

export default function App(){

  const [fontsLoaded, fontError] = useFonts({

    PlusJakartaSans_400Regular,

    PlusJakartaSans_500Medium,

    PlusJakartaSans_600SemiBold,

    PlusJakartaSans_700Bold,

    PlusJakartaSans_800ExtraBold,

  });





  const [screen,setScreen]=useState<Screen>('splash');



  const [slide,setSlide]=useState(0),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[resetEmail,setResetEmail]=useState('');



  const [errors,setErrors]=useState<{email?:string;password?:string}>({});

  const [resetSent,setResetSent]=useState(false);



  const [remember,setRemember]=useState(false),[notice,setNotice]=useState('');

  const [isLoggingIn,setIsLoggingIn]=useState(false);

  const [candidateName,setCandidateName]=useState('');

  const [candidateUser,setCandidateUser]=useState<CandidateUser|null>(null);



  const [reg,setReg]=useState({name:'',phone:'',email:'',password:'',confirm:'',gender:'',birthCity:'',birthDate:'',address:'',province:'',city:'',district:'',postal:'',education:'',institution:'',major:'',startYear:'',endYear:''});



  const [otp,setOtp]=useState(''),[showEducation,setShowEducation]=useState(false),[eduAdded,setEduAdded]=useState(false);



  const editReg=(key:keyof typeof reg)=>(v:string)=>setReg(prev=>({...prev,[key]:v}));



  const [registrationError,setRegistrationError]=useState('');



  const submitRegister=()=>{if(!reg.name.trim()||!reg.phone.trim()||!validEmail(reg.email)||reg.password.length<6||reg.password!==reg.confirm){setRegistrationError('Lengkapi nama, nomor telepon, email valid, dan password minimal 6 karakter yang sama.');return;}setRegistrationError('');go('registerSuccess');};



  const submitProfile=()=>{if(!reg.gender||!reg.birthCity||!reg.birthDate||!reg.address||!reg.province||!reg.city){setRegistrationError('Lengkapi informasi pribadi yang wajib diisi.');return;}setRegistrationError('');go('demo');};



  const go=(next:Screen)=>{setErrors({});setNotice('');setResetSent(false);setScreen(next);};



  useEffect(()=>{if(screen==='splash'){const t=setTimeout(()=>setScreen('onboarding'),1800);return()=>clearTimeout(t);}},[screen]);



  useEffect(()=>{const sub=BackHandler.addEventListener('hardwareBackPress',()=>{if(screen==='forgot'||screen==='demo'||screen==='register'){go('login');return true;}if(screen==='onboarding'&&slide>0){setSlide(slide-1);return true;}return false;});return()=>sub.remove();},[screen,slide]);



  const login=async()=>{
    const e={
      email:validEmail(email)?undefined:'Masukkan alamat email yang valid.',
      password:password.length?undefined:'Kata sandi wajib diisi.',
    };

    setErrors(e);
    if(e.email||e.password){return;}

    setIsLoggingIn(true);
    setNotice('');

    try{
      const candidate=await candidateApi.login(email,password,remember);
      setCandidateName(candidate.full_name||candidate.email);
      setCandidateUser(candidate);
      setPassword('');
      go('dashboard');
    }catch(error){
      if(axios.isAxiosError(error)){
        const status=error.response?.status;
        const message=error.response?.data?.message;

        if(status===401){setNotice('Email atau kata sandi salah.');}
        else if(status===403){setNotice(message??'Email belum diverifikasi atau akun tidak diizinkan.');}
        else if(status===422){setNotice('Periksa kembali email dan kata sandi.');}
        else if(error.code==='ECONNABORTED'){setNotice('Server terlalu lama merespons. Silakan coba lagi.');}
        else if(!error.response){setNotice('Tidak dapat terhubung ke server HireLoop.');}
        else{setNotice(message??'Login gagal. Silakan coba lagi.');}
      }else{
        setNotice(error instanceof Error?error.message:'Terjadi kesalahan saat login.');
      }
    }finally{
      setIsLoggingIn(false);
    }
  };



  const reset=()=>{if(!validEmail(resetEmail)){setErrors({email:'Masukkan alamat email yang valid.'});return;}setErrors({});setResetSent(true);};



  const dark=screen==='splash'||screen==='login'||screen==='dashboard'||screen==='register'||screen==='verify'||screen==='registerSuccess'||screen==='verifySuccess'||screen==='profile'||(screen==='onboarding'&&slide%2===1);



  // Keep all React hooks above this conditional render.

  if (!fontsLoaded && !fontError) {

    return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>

      <ActivityIndicator size="large" color={C.blue}/>

    </View>;

  }



  return <SafeAreaProvider><View style={s.desktop}><View style={[s.app,{backgroundColor:dark?C.navy:'#FFFFFF'}]}><StatusBar style={dark?'light':'dark'}/>{dark&&screen!=='dashboard'&&<View pointerEvents="none" style={StyleSheet.absoluteFill}><View style={s.orbitOne}/><View style={s.orbitTwo}/></View>}<SafeAreaView edges={screen==='dashboard'?[]:undefined} style={{flex:1}}><KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{flex:1}}>



    {screen==='splash'?<View style={s.splash}><Logo/><View style={s.dash}/><Text style={s.splashText}>Find the right job.</Text><Text style={[s.splashText,{color:'#7AE6FF'}]}>Loop into your future</Text><ActivityIndicator style={{marginTop:44}} color={C.cyan}/></View>:



    screen==='onboarding'?<ScrollView contentContainerStyle={s.onboard} bounces={false}><View style={s.topRow}>{slide>0?<Pressable accessibilityRole="button" accessibilityLabel="Onboarding sebelumnya" onPress={()=>setSlide(slide-1)} style={s.back}><Ionicons name="arrow-back" size={21} color={dark?'white':C.ink}/></Pressable>:<View/>}<Link label="Lewati" light={dark} onPress={()=>go('login')}/></View><View style={s.art}>



      {slide === 0 ? (



        <Image source={require('./src/assets/Onboarding1.png')} style={s.onboardingImage} resizeMode="contain" accessibilityLabel="Ilustrasi mencari pekerjaan menggunakan laptop" />



      ) : slide === 1 ? (



        <Image source={require('./src/assets/Onboarding2.png')} style={s.onboardingImage} resizeMode="contain" accessibilityLabel="Ilustrasi memantau status lamaran kerja" />



      ) : slide === 2 ? (



        <Image source={require('./src/assets/Onboarding3.png')} style={s.onboardingImage} resizeMode="contain" accessibilityLabel="Ilustrasi melamar ke banyak perusahaan" />



      ) : (



        <Image source={require('./src/assets/Onboarding4.png')} style={s.onboardingImage} resizeMode="contain" accessibilityLabel="Ilustrasi rekomendasi pekerjaan" />



      )}



    </View><View style={s.slideCopy}><GradientHeading text={slides[slide].title} dark={dark} /><Text style={[s.body,{color:dark?'#C3CCE7':'#67748E'}]}>{slides[slide].body}</Text><View style={s.dots}>{slides.map((_,i)=><Pressable key={i} accessibilityRole="button" accessibilityLabel={`Halaman onboarding ${i+1}`} accessibilityState={{selected:i===slide}} hitSlop={10} onPress={()=>setSlide(i)}><View style={[s.dot,{backgroundColor:i===slide?C.cyan:dark?'#4C5A92':'#D9E2F3',width:i===slide?20:6}]}/></Pressable>)}</View><Button label={slide===3?'Mulai Sekarang':'Selanjutnya'} onPress={()=>slide===3?go('login'):setSlide(slide+1)}/><Text style={[s.step,{color:dark?'#8D9BC6':'#A1ADC1'}]}>0{slide+1} / 04</Text></View></ScrollView>:



    screen==='login'?<LoginPage email={email} password={password} errors={errors} remember={remember} notice={notice} loading={isLoggingIn} onEmailChange={setEmail} onPasswordChange={setPassword} onRememberChange={setRemember} onNoticeChange={setNotice} onLogin={login} onForgotPassword={()=>{setResetEmail(email);go('forgot');}} onRegister={()=>go('register')} onShowOnboarding={()=>{setSlide(0);go('onboarding');}}/>:



    screen==='register'?<ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.regPage}><Pressable onPress={()=>go('login')} style={s.regBack}><Ionicons name="arrow-back" size={20} color="white"/><Text style={s.regBackText}>Kembali</Text></Pressable><Text style={s.regTitle}>Buat Akun</Text><Text style={s.regDescription}>Lengkapi informasi berikut untuk memulai perjalanan kariermu bersama HireLoop.</Text><View style={s.regCard}><RegInput label="Nama Depan & Belakang *" value={reg.name} setValue={editReg('name')} placeholder="Nama lengkap"/><RegInput label="Nomor Telepon *" value={reg.phone} setValue={editReg('phone')} placeholder="08xxxxxxxxxx" keyboard="phone-pad"/><RegInput label="Email *" value={reg.email} setValue={editReg('email')} placeholder="nama@email.com" keyboard="email-address"/><RegInput label="Buat Password *" value={reg.password} setValue={editReg('password')} placeholder="Minimal 6 karakter" secret/><RegInput label="Konfirmasi Password *" value={reg.confirm} setValue={editReg('confirm')} placeholder="Ulangi password" secret/>{!!registrationError&&<Text style={s.regError}>{registrationError}</Text>}<Button label="Daftar" onPress={submitRegister}/></View><View style={s.regFooter}><Text style={{fontFamily:F.regular,color:'#BDC9E8',fontSize:12}}>Sudah punya akun? </Text><Link label="Masuk" light onPress={()=>go('login')}/></View><Text style={s.previewInfo}>PREVIEW · Belum terhubung ke layanan registrasi</Text></ScrollView>:



    screen==='registerSuccess'?<View style={s.regCentered}><Ionicons name="mail-unread-outline" size={70} color={C.cyan}/><Text style={s.regTitle}>Registrasi Berhasil!</Text><Text style={s.regCenteredText}>Akun simulasi untuk {reg.email} telah dibuat. Lanjutkan ke verifikasi OTP.</Text><Button label="Lanjut Verifikasi" onPress={()=>go('verify')}/></View>:



    screen==='verify'?<ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.regPage}><Pressable style={s.regBack} onPress={()=>go('register')}><Ionicons name="arrow-back" color="white" size={20}/><Text style={s.regBackText}>Kembali</Text></Pressable><View style={{height:130,alignItems:'center',justifyContent:'center'}}><Ionicons name="shield-checkmark-outline" size={96} color={C.cyan}/></View><View style={s.otpCard}><Text style={s.otpTitle}>Verifikasi OTP</Text><Text style={s.otpHint}>Masukkan 6 digit kode yang dikirim melalui email ke {reg.email}.</Text><TextInput keyboardType="number-pad" maxLength={6} value={otp} onChangeText={setOtp} style={s.otpInput} placeholder="• • • • • •" placeholderTextColor="#A2B3CD" accessibilityLabel="Kode verifikasi enam digit"/><Button label="Verifikasi OTP" onPress={()=>{if(otp.length===6){setRegistrationError('');go('verifySuccess');}else{setRegistrationError('Masukkan 6 digit OTP untuk melanjutkan.');}}}/>{!!registrationError&&<Text style={s.regError}>{registrationError}</Text>}<Text style={s.otpHint}>Preview UI: masukkan sembarang 6 digit. Tidak ada email yang dikirim.</Text></View></ScrollView>:



    screen==='verifySuccess'?<View style={s.regCentered}><Ionicons name="checkmark-circle" size={83} color="#34C57A"/><Text style={s.regTitle}>Verifikasi Berhasil!</Text><Text style={s.regCenteredText}>Email akunmu telah diverifikasi dalam mode preview. Selanjutnya lengkapi data diri.</Text><Button label="Lengkapi Data Diri" onPress={()=>go('profile')}/></View>:



    screen==='profile'?<ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.regPage}><Pressable style={s.regBack} onPress={()=>go('verifySuccess')}><Ionicons name="arrow-back" size={20} color="white"/><Text style={s.regBackText}>Kembali</Text></Pressable><Text style={s.regTitle}>Lengkapi Data Diri</Text><Text style={s.regDescription}>Lengkapi informasi berikut untuk meningkatkan peluang mendapatkan pekerjaan.</Text><View style={s.regCard}><Text style={s.sectionTitle}>Informasi Pribadi</Text><RegInput label="Nama Lengkap *" value={reg.name} setValue={editReg('name')}/><RegInput label="Jenis Kelamin *" value={reg.gender} setValue={editReg('gender')} placeholder="Laki-laki / Perempuan"/><RegInput label="Tempat Lahir *" value={reg.birthCity} setValue={editReg('birthCity')}/><RegInput label="Tanggal Lahir *" value={reg.birthDate} setValue={editReg('birthDate')} placeholder="DD/MM/YYYY"/><RegInput label="Alamat KTP *" value={reg.address} setValue={editReg('address')}/><RegInput label="Provinsi *" value={reg.province} setValue={editReg('province')}/><RegInput label="Kota / Kabupaten *" value={reg.city} setValue={editReg('city')}/><RegInput label="Kecamatan" value={reg.district} setValue={editReg('district')}/><RegInput label="Kode Pos" value={reg.postal} setValue={editReg('postal')} keyboard="number-pad"/><View style={s.educationRow}><View><Text style={s.sectionTitle}>Pendidikan</Text><Text style={s.educationSmall}>{eduAdded?`${reg.education} · ${reg.institution}`:'Belum ada data pendidikan'}</Text></View><Pressable onPress={()=>setShowEducation(true)} accessibilityRole="button" style={s.addEdu}><Ionicons name="add" size={15} color="white"/><Text style={{fontFamily:F.regular,color:'white',fontWeight:'700',fontSize:12}}>Tambah</Text></Pressable></View>{!!registrationError&&<Text style={s.regError}>{registrationError}</Text>}<Button label="Selanjutnya" onPress={submitProfile}/></View></ScrollView>:



    screen==='forgot'?<ForgotPasswordPage email={resetEmail} error={errors.email} isSubmitting={false} successVisible={resetSent} onEmailChange={setResetEmail} onSubmit={reset} onBack={()=>go('login')} onSuccessDismiss={()=>setResetSent(false)}/>:

    screen==='dashboard'&&candidateUser?<DashboardHome initialUser={candidateUser} onLogout={async()=>{await candidateApi.logout().catch(()=>undefined);setCandidateName('');setCandidateUser(null);go('login');}}/>:

    <ScrollView contentContainerStyle={s.result}><View style={s.resultIcon}><Ionicons name="checkmark-circle-outline" size={52} color={C.blue}/></View><Text style={s.resultTitle}>Login berhasil</Text><Text style={s.resultBody}>{candidateName?`Selamat datang, ${candidateName}. Akun kandidat berhasil terhubung ke backend HireLoop.`:'Akun kandidat berhasil terhubung ke backend HireLoop.'}</Text><Button label="Keluar" onPress={async()=>{await candidateApi.logout().catch(()=>undefined);setCandidateName('');go('login');}}/></ScrollView>}



  </KeyboardAvoidingView></SafeAreaView>{showEducation&&<View style={s.modalOverlay}><View style={s.modalCard}><Text style={s.modalTitle}>Tambah Pendidikan</Text><ScrollView keyboardShouldPersistTaps="handled" style={{maxHeight:410}}><RegInput label="Tingkat Pendidikan *" value={reg.education} setValue={editReg('education')} placeholder="SMA / SMK / D3 / S1 / S2"/><RegInput label="Nama Sekolah / Universitas *" value={reg.institution} setValue={editReg('institution')}/><RegInput label="Jurusan *" value={reg.major} setValue={editReg('major')}/><RegInput label="Tahun Masuk" value={reg.startYear} setValue={editReg('startYear')} keyboard="number-pad"/><RegInput label="Tahun Lulus" value={reg.endYear} setValue={editReg('endYear')} keyboard="number-pad"/></ScrollView><View style={s.modalActions}><Pressable style={s.modalCancel} onPress={()=>setShowEducation(false)}><Text style={{fontFamily:F.regular,color:C.ink}}>Batal</Text></Pressable><Pressable style={s.modalSave} onPress={()=>{if(reg.education&&reg.institution&&reg.major){setEduAdded(true);setShowEducation(false);}else{setRegistrationError('Lengkapi tingkat pendidikan, sekolah, dan jurusan.');}}}><Text style={{fontFamily:F.regular,color:'white',fontWeight:'700'}}>Simpan</Text></Pressable></View></View></View>}</View></View></SafeAreaProvider>;



}



function RegInput({label,value,setValue,placeholder='',secret=false,keyboard='default'}:{label:string;value:string;setValue:(v:string)=>void;placeholder?:string;secret?:boolean;keyboard?:'default'|'email-address'|'phone-pad'|'number-pad'}){return <View style={{marginBottom:14}}><Text style={s.regLabel}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={setValue} placeholder={placeholder||label} placeholderTextColor="#9AA6B9" style={s.regTextInput} secureTextEntry={secret} keyboardType={keyboard} autoCapitalize={keyboard==='email-address'?'none':'sentences'}/></View>}



const s=StyleSheet.create({



 regPage:{flexGrow:1,padding:22,paddingTop:12,paddingBottom:45},regBack:{flexDirection:'row',alignItems:'center',gap:6,minHeight:45},regBackText:{fontFamily:F.medium,color:'white',fontSize:13},regTitle:{fontFamily:F.extrabold,fontSize:25,color:'white',marginTop:10},regDescription:{fontFamily:F.regular,color:'#CBD6F1',fontSize:12,lineHeight:19,marginTop:8,marginBottom:22},regCard:{borderRadius:17,backgroundColor:'#101D59',padding:18,gap:2},regLabel:{fontFamily:F.semibold,color:'#E0E8FF',fontSize:12,marginBottom:7},regTextInput:{fontFamily:F.regular,minHeight:46,backgroundColor:'white',borderRadius:7,paddingHorizontal:13,fontSize:13,color:C.ink},regFooter:{flexDirection:'row',alignItems:'center',justifyContent:'center',marginTop:12},previewInfo:{fontFamily:F.regular,textAlign:'center',color:'#90A4D6',fontSize:10,marginTop:12},regError:{fontFamily:F.regular,color:'#FF9FA9',fontSize:12,marginBottom:12,lineHeight:18},regCentered:{flex:1,padding:30,justifyContent:'center',alignItems:'center',gap:22},regCenteredText:{fontFamily:F.regular,color:'#D2E0FF',fontSize:14,textAlign:'center',lineHeight:22,marginBottom:6},otpCard:{backgroundColor:'white',borderRadius:18,padding:22},otpTitle:{fontFamily:F.extrabold,color:C.blue,fontSize:22,textAlign:'center'},otpHint:{fontFamily:F.regular,color:C.muted,textAlign:'center',lineHeight:19,fontSize:12,marginTop:12,marginBottom:18},otpInput:{fontFamily:F.bold,borderColor:'#DCE7FC',borderWidth:1.5,borderRadius:9,backgroundColor:'#F5F8FF',height:56,textAlign:'center',fontSize:24,letterSpacing:10,color:C.blue,marginBottom:17},sectionTitle:{fontFamily:F.bold,color:'white',fontSize:16,marginBottom:14},educationRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginVertical:16},educationSmall:{fontFamily:F.regular,color:'#AFC2EC',fontSize:11,maxWidth:220},addEdu:{backgroundColor:C.blue,flexDirection:'row',alignItems:'center',gap:3,padding:10,borderRadius:9},modalOverlay:{position:'absolute',top:0,bottom:0,left:0,right:0,backgroundColor:'rgba(0,0,0,0.70)',justifyContent:'center',padding:20},modalCard:{backgroundColor:'white',borderRadius:17,padding:20},modalTitle:{fontFamily:F.bold,fontSize:18,color:C.ink,marginBottom:20},modalActions:{flexDirection:'row',gap:12,marginTop:15},modalCancel:{flex:1,backgroundColor:'#E9EDF6',borderRadius:8,padding:13,alignItems:'center'},modalSave:{flex:1,backgroundColor:C.blue,borderRadius:8,padding:13,alignItems:'center'},



 desktop:{flex:1,backgroundColor:'#EAF0F9',alignItems:'center'},app:{flex:1,width:'100%',maxWidth:440,overflow:'hidden'},orbitOne:{position:'absolute',width:360,height:360,borderRadius:180,borderWidth:1,borderColor:'#14307A',top:-250,right:-70},orbitTwo:{position:'absolute',width:490,height:490,borderRadius:245,borderWidth:1,borderColor:'#123073',bottom:-335,left:-160},



 splashLogoImage:{width:304,height:75,alignSelf:'center'},splash:{flex:1,justifyContent:'center',alignItems:'center',minHeight:500},dash:{width:42,height:3,borderRadius:3,backgroundColor:C.cyan,marginTop:38,marginBottom:28},splashText:{fontFamily:F.regular,color:'#D3DFF9',fontSize:16,lineHeight:27,letterSpacing:.4},



 onboard:{flexGrow:1,paddingHorizontal:30,paddingBottom:24},topRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',minHeight:64},back:{width:40,height:44,justifyContent:'center',alignItems:'center'},link:{paddingVertical:12},art:{flex:1,justifyContent:'center',minHeight:385,alignItems:'center'},onboardingImage:{width:'112%',height:385,alignSelf:'center'},slideCopy:{paddingTop:24},heading:{fontFamily:F.bold,fontSize:27,lineHeight:35,letterSpacing:-.6},body:{fontFamily:F.regular,fontSize:14,lineHeight:22,marginTop:14,minHeight:66},dots:{flexDirection:'row',gap:8,marginTop:24,marginBottom:30},dot:{height:6,borderRadius:3},button:{borderRadius:10,overflow:'hidden'},buttonInner:{height:52,paddingHorizontal:22,flexDirection:'row',justifyContent:'center',alignItems:'center',gap:16},buttonText:{fontFamily:F.bold,color:'white',fontSize:14},step:{fontFamily:F.medium,fontSize:10,letterSpacing:2,textAlign:'center',marginTop:19},



 result:{flexGrow:1,justifyContent:'center',padding:32},resultIcon:{alignSelf:'center',padding:25,backgroundColor:'#EEF4FF',borderRadius:60,marginBottom:25},resultTitle:{fontFamily:F.bold,fontSize:26,textAlign:'center',color:C.ink},resultBody:{fontFamily:F.regular,fontSize:14,lineHeight:23,textAlign:'center',color:C.muted,marginTop:16,marginBottom:30},



});
