import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

export function SignInForm() {
  const router = useRouter();
  const [phone, setPhone] = React.useState('+91 98765 43210');
  const [otp, setOtp] = React.useState(['2', '4', '8', '', '', '']);
  const [step, setStep] = React.useState<'phone' | 'otp'>('phone');
  const [seconds, setSeconds] = React.useState(28);
  const otpRefs = React.useRef<(TextInput | null)[]>([]);

  React.useEffect(() => {
    if (step !== 'otp' || seconds === 0) return;
    const timer = setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [seconds, step]);

  function continueWithPhone() {
    if (phone.replace(/\D/g, '').length < 10) {
      Alert.alert('Check your number', 'Enter a valid phone number to continue.');
      return;
    }
    setStep('otp');
  }

  function updateOtp(value: string, index: number) {
    const digit = value.replace(/\D/g, '').slice(-1);
    setOtp((current) => current.map((item, itemIndex) => itemIndex === index ? digit : item));
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function resendCode() {
    setSeconds(28);
    setOtp(['', '', '', '', '', '']);
    otpRefs.current[0]?.focus();
  }

  function verify() {
    if (otp.join('').length !== 6) {
      Alert.alert('Enter your code', 'Type the six-digit code we sent you.');
      return;
    }
    router.replace('/(tabs)');
  }

  return (
    <View className="flex-1 px-5 pt-5">
      <Pressable onPress={() => step === 'otp' ? setStep('phone') : router.back()} className="h-10 w-10 items-center justify-center" hitSlop={10}>
        <ArrowLeft size={26} color="#18161B" />
      </Pressable>

      <View className="mt-12">
        <Text className="font-serif text-[44px] leading-12 text-[#18161B]">
          {step === 'phone' ? 'What’s your number?' : 'Enter your code'}
        </Text>
        <Text className="mt-5 text-[17px] leading-6 text-[#716B74]">
          {step === 'phone' ? 'We’ll send a one-time code. No passwords.' : `We sent a six-digit code to ${phone}.`}
        </Text>
      </View>

      {step === 'phone' ? (
        <View className="mt-14">
          <Text className="mb-3 text-[17px] text-[#716B74]">Phone number</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoFocus
            className="h-21.5 rounded-[20px] border-2 border-[#D8D0C6] bg-[#EEE7DD] px-7 text-[28px] text-[#18161B]"
            placeholder="+91 98765 43210"
            placeholderTextColor="#9B949D"
          />
        </View>
      ) : (
        <View className="mt-14">
          <Text className="mb-3 text-[17px] text-[#716B74]">One-time code</Text>
          <View className="flex-row gap-2">
            {otp.map((digit, index) => <TextInput
              key={index}
              ref={(input) => { otpRefs.current[index] = input; }}
              value={digit}
              onChangeText={(value) => updateOtp(value, index)}
              keyboardType="number-pad"
              maxLength={1}
              autoFocus={index === 0}
              className={`h-24 flex-1 rounded-[20px] border-2 bg-[#F4EFE7] text-center font-serif text-[30px] ${digit ? 'border-[#EF5D62] text-[#EF5D62]' : 'border-[#D8D0C6] text-[#18161B]'}`}
            />)}
          </View>
          <Pressable onPress={resendCode} disabled={seconds > 0} className="mt-4 items-center">
            <Text className={`text-[15px] ${seconds > 0 ? 'text-[#716B74]' : 'font-semibold text-[#DF5B5F]'}`}>
              {seconds > 0 ? `Resend in ${seconds}s` : 'Resend code'}
            </Text>
          </Pressable>
        </View>
      )}

      <View className="mt-auto pb-7">
        <Pressable onPress={step === 'phone' ? continueWithPhone : verify} className="h-20 items-center justify-center rounded-full bg-[#E45D62]">
          <Text className="text-[17px] font-bold text-white">{step === 'phone' ? 'Send code' : 'Verify and continue'}</Text>
        </Pressable>
      </View>
    </View>
  );
}
