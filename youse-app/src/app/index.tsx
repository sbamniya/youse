import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { ImageBackground, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=88';

export default function WelcomeScreen() {
  return (
    <ImageBackground
      source={{ uri: HERO_IMAGE }}
      resizeMode="cover"
      className="flex-1 bg-[#0A0A0D]"
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.08)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.94)']}
        locations={[0, 0.42, 0.82]}
        className="absolute inset-0"
      />
      <SafeAreaView className="flex-1 justify-end px-5 pb-7">
        <View className="items-center">
          <Text className="font-serif text-[62px] leading-[68px] text-white">
            Youse
          </Text>
          <Text className="mt-1 text-[15px] font-medium text-white/85">
            A private space for two
          </Text>
        </View>

        <View className="mt-40">
          <Link href="/(auth)/sign-up" asChild>
            <Pressable className="h-20 items-center justify-center rounded-full bg-[#E45D62] shadow-lg shadow-[#E45D62]/30">
              <Text className="text-[16px] font-bold text-white">Get started</Text>
            </Pressable>
          </Link>

          <View className="mt-7 flex-row items-center justify-center">
            <Text className="text-[13px] font-medium text-white/60">
              Already have an invite?
            </Text>
            <Link href="/(auth)/sign-in" asChild>
              <Pressable hitSlop={8}>
                <Text className="ml-3 text-[13px] font-semibold text-white">
                  Use invite code
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
