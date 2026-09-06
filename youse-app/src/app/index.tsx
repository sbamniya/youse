import { ArrowLeft, Camera, Check, ChevronRight } from 'lucide-react-native';
import * as React from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const profileImage = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=82';
const steps = [
  ['Let’s get to know you', 'This is your space. Tell us a bit about yourself.'],
  ['Choose a profile', 'Add a photo or keep the default. You can change this later.'],
  ['What are you two?', 'Choose the relationship type that fits you best.'],
  ['How do you share life right now?', 'This helps with plans, timing, and the prompts you see.'],
  ['What matters most?', 'Pick one. You can change this anytime.'],
  ['Your timezone', 'We’ll use this for reminders and shared plans.'],
  ['Daily question time', 'Choose when you’re most likely to have a minute together.'],
  ['You’re set', 'Next, invite your partner. Your trial won’t start until they join.'],
];
const relationships = [['Dating', 'We’re seeing each other'], ['In a committed relationship', 'We’re together and serious about us'], ['Engaged', 'We’re planning the next chapter'], ['Married / civil partnership', 'We’ve made it official']];
const situations = [['Same city', 'We see each other regularly'], ['Long distance', 'Different cities or countries'], ['Living together', 'We share a home']];
const goals = [['Stay connected', 'Make everyday time feel closer'], ['Talk better', 'Less reactive, more clear'], ['Make plans', 'Dates, trips, shared lists'], ['A bit of everything', 'Keep it balanced']];
const times = ['7–9 AM', '12–2 PM', '6–8 PM', '9–11 PM'];

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [name, setName] = React.useState('Meera');
  const [relationship, setRelationship] = React.useState('Dating');
  const [situation, setSituation] = React.useState('Same city');
  const [goal, setGoal] = React.useState('Stay connected');
  const [time, setTime] = React.useState('6–8 PM');

  function next() {
    if (step === 8) {
      router.replace('/(tabs)');
      return;
    }
    setStep((current) => current + 1);
  }

  function previous() {
    if (step === 1) {
      router.back();
      return;
    }
    setStep((current) => current - 1);
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F4EFE7]" edges={['top', 'bottom']}>
      <View className="flex-1 px-5 pt-3">
        <View className="flex-row items-center">
          <Pressable onPress={previous} className="h-10 w-10 items-center justify-center" hitSlop={8}><ArrowLeft size={25} color="#18161B" /></Pressable>
          <View className="mx-4 h-1 flex-1 overflow-hidden rounded-full bg-[#E5DDD2]"><View style={{ width: `${(step / 8) * 100}%` }} className="h-full bg-[#18161B]" /></View>
          <Text className="w-10 text-right text-[10px] text-[#716B74]">{step}/8</Text>
        </View>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingTop: 35, paddingBottom: 20 }}>
          <Text className="text-[10px] uppercase tracking-[1px] text-[#716B74]">{step} of 8</Text>
          <Text className="mt-2 font-serif text-[39px] leading-10 text-[#18161B]">{steps[step - 1][0]}</Text>
          <Text className="mt-4 text-[16px] leading-6 text-[#716B74]">{steps[step - 1][1]}</Text>
          {step === 1 ? <View className="mt-9"><View className="mx-auto h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-[#E5DDD2]"><Image source={{ uri: profileImage }} className="h-full w-full" /><View className="absolute bottom-1 right-1 rounded-full border border-[#D8D0C6] bg-[#F4EFE7] p-2"><Camera size={16} color="#18161B" /></View></View><Text className="mb-2 mt-8 text-[11px] uppercase tracking-[1px] text-[#716B74]">What’s your name?</Text><TextInput value={name} onChangeText={setName} className="h-14 rounded-xl border border-[#D8D0C6] bg-[#EEE7DD] px-4 text-[17px] text-[#18161B]" /></View> : null}
          {step === 2 ? <View className="mt-8"><Image source={{ uri: profileImage }} className="mx-auto h-32 w-32 rounded-full" /><View className="mt-8 gap-2"><Choice label="Use this photo" detail="Visible only to your partner" selected /><Choice label="Choose another" detail="Upload from your phone" /></View></View> : null}
          {step === 3 ? <ChoiceList values={relationships} selected={relationship} onSelect={setRelationship} /> : null}
          {step === 4 ? <ChoiceList values={situations} selected={situation} onSelect={setSituation} /> : null}
          {step === 5 ? <ChoiceList values={goals} selected={goal} onSelect={setGoal} grid /> : null}
          {step === 6 ? <View className="mt-8"><Text className="mb-2 text-[11px] uppercase tracking-[1px] text-[#716B74]">Timezone</Text><View className="rounded-xl border border-[#D8D0C6] bg-[#EEE7DD] px-4 py-4"><Text className="text-[16px] text-[#18161B]">(GMT+5:30) India Standard Time</Text></View></View> : null}
          {step === 7 ? <View className="mt-8 flex-row flex-wrap gap-2">{times.map((item) => <Pressable key={item} onPress={() => setTime(item)} className={`w-[48%] rounded-xl border px-3 py-5 ${time === item ? 'border-[#DF5B5F] bg-[#DF5B5F]' : 'border-[#D8D0C6] bg-transparent'}`}><Text className={`text-center text-[12px] ${time === item ? 'font-semibold text-white' : 'text-[#18161B]'}`}>{item}</Text></Pressable>)}</View> : null}
          {step === 8 ? <View className="mt-8 flex-row items-center rounded-2xl bg-[#EEE7DD] p-4"><View className="h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#E5DDD2]"><Image source={{ uri: profileImage }} className="h-full w-full" /></View><View className="ml-3 flex-1"><Text className="text-[12px] font-semibold text-[#18161B]">{name}</Text><Text className="mt-1 text-[10px] text-[#716B74]">{relationship} · {situation} · {goal}</Text></View><Check size={18} color="#DF5B5F" /></View> : null}
        </ScrollView>
        <Pressable onPress={next} className="mb-3 h-16 items-center justify-center rounded-full bg-[#E45D62]"><Text className="text-[16px] font-bold text-white">{step === 8 ? 'Invite partner' : 'Continue'}</Text></Pressable>
      </View>
    </SafeAreaView>
  );
}

function ChoiceList({ values, selected, onSelect, grid = false }: { values: string[][]; selected: string; onSelect: (value: string) => void; grid?: boolean }) {
  return <View className={`mt-8 gap-2 ${grid ? 'flex-row flex-wrap' : ''}`}>{values.map(([label, detail]) => <Choice key={label} label={label} detail={detail} selected={selected === label} onPress={() => onSelect(label)} grid={grid} />)}</View>;
}

function Choice({ label, detail, selected = false, onPress, grid = false }: { label: string; detail: string; selected?: boolean; onPress?: () => void; grid?: boolean }) {
  return <Pressable onPress={onPress} className={`${grid ? 'w-[48%] min-h-20' : ''} flex-row items-center justify-between rounded-xl border p-4 ${selected ? 'border-[#DF5B5F] bg-[#F9DAD4]' : 'border-[#D8D0C6] bg-transparent'}`}><View className="flex-1"><Text className="text-[12px] font-semibold text-[#18161B]">{label}</Text><Text className="mt-1 text-[10px] leading-4 text-[#716B74]">{detail}</Text></View>{selected ? <Check size={17} color="#DF5B5F" /> : <ChevronRight size={17} color="#9B949D" />}</Pressable>;
}
