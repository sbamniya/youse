import { ArrowRight, Check, Clock3, MapPin, MessageCircleHeart, Sparkles } from 'lucide-react-native';
import * as React from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [selectedMood, setSelectedMood] = React.useState('🙂');
  const isTrialVisible = true;

  return (
    <SafeAreaView className="flex-1 bg-[#F1F2F4]" edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        <View className="px-4 pb-4 pt-3">
          <View className="flex-row items-center">
            <View>
              <Text className="font-serif text-[29px] leading-8 text-[#18161B]">Meera + Arjun</Text>
              <Text className="mt-1 text-[11px] text-[#716B74]">Saturday, 5 September</Text>
            </View>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80' }}
              className="ml-auto h-11 w-11 rounded-full"
            />
          </View>
        </View>

        <View className="gap-2 px-3">
          {isTrialVisible ? (
            <Pressable onPress={() => Alert.alert('Youse+ trial', '11 days left. Everything is unlocked, with no card added.')} className="flex-row items-center rounded-2xl border border-[#E7B4B0] bg-[#F9DAD4] px-3 py-3">
              <Sparkles size={18} color="#C84449" />
              <View className="ml-3 flex-1">
                <Text className="text-[11px] font-semibold text-[#18161B]">Youse+ trial · 11 days left</Text>
                <Text className="mt-1 text-[9px] text-[#716B74]">Everything is unlocked. No card added.</Text>
              </View>
              <ArrowRight size={17} color="#C84449" />
            </Pressable>
          ) : null}

          <Pressable onPress={() => Alert.alert('Daily reflection', 'Your answer will be visible after both of you respond.')} className="rounded-2xl border border-[#E1E3E6] bg-white p-4">
            <Text className="text-[9px] uppercase tracking-[1px] text-[#716B74]">Reflection</Text>
            <View className="mt-2 flex-row items-center">
              <Text className="flex-1 font-serif text-[21px] leading-6 text-[#18161B]">What’s something you wish we did more often?</Text>
              <ArrowRight size={19} color="#716B74" />
            </View>
          </Pressable>

          <View className="rounded-2xl bg-white p-4">
            <Text className="text-[9px] uppercase tracking-[1px] text-[#716B74]">Today’s vibe</Text>
            <Text className="mt-1 text-[11px] text-[#716B74]">How are you feeling?</Text>
            <View className="mt-3 flex-row gap-2">
              {['😕', '😐', '🙂', '😌', '😄'].map((mood) => (
                <Pressable key={mood} onPress={() => setSelectedMood(mood)} className={`flex-1 items-center rounded-xl border py-2 ${selectedMood === mood ? 'border-[#DF5B5F] bg-[#F9DAD4]' : 'border-[#D8D0C6]'}`}>
                  <Text className="text-xl">{mood}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="flex-row gap-2">
            <View className="min-h-30 flex-1 rounded-2xl bg-white p-3">
              <Text className="text-[9px] uppercase tracking-[1px] text-[#716B74]">Next up</Text>
              <Text className="mt-2 text-[13px] font-semibold text-[#18161B]">Dinner at Veronica’s</Text>
              <Text className="mt-1 text-[10px] text-[#716B74]">Tonight · 8:30 PM</Text>
              <View className="mt-auto flex-row items-center"><Clock3 size={13} color="#C84449" /><Text className="ml-1 text-[9px] text-[#716B74]">In 2 hours</Text></View>
            </View>
            <View className="min-h-30 flex-1 rounded-2xl bg-white p-3">
              <Text className="font-serif text-[27px] text-[#18161B]">12 days</Text>
              <Text className="text-[10px] text-[#716B74]">until Goa</Text>
              <View className="mt-auto flex-row items-center"><MapPin size={13} color="#C84449" /><Text className="ml-1 text-[9px] text-[#716B74]">Our next escape</Text></View>
            </View>
          </View>

          <Pressable onPress={() => Alert.alert('From Arjun', 'Shared a photo · 22m ago')} className="flex-row items-center rounded-2xl bg-white p-3">
            <Image source={{ uri: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=80' }} className="h-10 w-10 rounded-xl" />
            <View className="ml-3 flex-1"><Text className="text-[11px] font-semibold text-[#18161B]">From Arjun</Text><Text className="mt-1 text-[9px] text-[#716B74]">Shared a photo · 22m ago</Text></View>
            <ArrowRight size={17} color="#716B74" />
          </Pressable>

          <View className="rounded-2xl bg-white p-4">
            <View className="flex-row items-end justify-between"><View><Text className="text-[9px] uppercase tracking-[1px] text-[#716B74]">Send a poke</Text><Text className="mt-1 text-[11px] font-semibold text-[#18161B]">A tiny signal, no conversation required.</Text></View><Text className="text-[9px] text-[#716B74]">to Arjun</Text></View>
            <View className="mt-3 flex-row flex-wrap gap-2">
              {['Thinking of you', 'Proud of you', 'Miss you', 'Call me'].map((poke) => <Pressable key={poke} onPress={() => Alert.alert('Poke sent', poke)} className="w-[48%] rounded-xl bg-[#F1F2F4] px-2 py-3"><Text className="text-[10px] text-[#18161B]">{poke}</Text></Pressable>)}
            </View>
          </View>

          <View className="mt-2 flex-row items-end justify-between"><Text className="text-[9px] uppercase tracking-[1px] text-[#716B74]">This week</Text><Text className="text-[9px] text-[#716B74]">See insights</Text></View>
          <View className="flex-row gap-2">
            {[['4', 'questions answered'], ['2', 'plans together'], ['3', 'shared moments']].map(([value, label]) => <View key={label} className="flex-1 rounded-2xl bg-white p-3"><Text className="font-serif text-[25px] text-[#18161B]">{value}</Text><Text className="mt-1 text-[9px] leading-3 text-[#716B74]">{label}</Text></View>)}
          </View>

          <View className="flex-row items-center overflow-hidden rounded-2xl bg-white"><Image source={{ uri: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=500&q=80' }} className="h-24 w-24" /><View className="flex-1 p-3"><Text className="text-[9px] uppercase tracking-[1px] text-[#716B74]">On this day</Text><Text className="mt-1 text-[11px] font-semibold text-[#18161B]">Your first Goa trip</Text><Text className="mt-1 text-[9px] text-[#716B74]">2 years ago · 8 photos</Text></View></View>

          <Pressable onPress={() => Alert.alert('Weekly check-in', 'A quiet 10-minute reset for the two of you.')} className="rounded-2xl border border-[#E7B4B0] bg-[#F9DAD4] p-4"><View className="flex-row items-center"><View className="items-center justify-center rounded-full bg-[#DF5B5F] p-2"><Check size={15} color="#FFFFFF" /></View><View className="ml-3 flex-1"><Text className="text-[11px] font-semibold text-[#18161B]">Weekly check-in</Text><Text className="mt-1 text-[9px] leading-3 text-[#716B74]">10 minutes to reset, appreciate, and plan the week together.</Text></View></View><View className="mt-3 flex-row items-center"><MessageCircleHeart size={15} color="#C84449" /><Text className="ml-2 text-[10px] font-semibold text-[#C84449]">Start weekly check-in</Text></View></Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
