import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, Platform, KeyboardAvoidingView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useBank } from '@/context/BankContext';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const AI_RESPONSES: Record<string, string> = {
  spending: 'Here is your spending breakdown for July:\n\n• Food & Dining: 1,200 SAR\n• Shopping: 800 SAR\n• Bills & Utilities: 500 SAR\n• Transport: 350 SAR\n• Entertainment: 250 SAR\n\nTotal: 3,100 SAR — 18% below your monthly average. Excellent financial discipline this month!',
  saving: 'Based on your income and spending velocity, I recommend saving 2,500 SAR/month. At this rate, you will reach your car fund goal (18,000 SAR) in just 3 months. You are already at 68% — incredible progress!',
  invest: 'Gold prices are currently 8% lower than 3 months ago. With your current savings rate, allocating 500 SAR/month to a diversified index fund could yield 9–12% annually. Would you like a detailed projection?',
  balance: 'Your current balance is 25,450 SAR. After upcoming bills (STC: 180 SAR, DEWA: 320 SAR), you will have approximately 24,950 SAR available. Your next salary arrives in 9 days — you are in a strong position.',
  fraud: 'I have detected unusual activity on your account. A withdrawal attempt of 50,000 SAR from an unrecognized device in a different city was blocked. Please review this immediately in the Fraud Protection section to secure your account.',
  transfer: 'Before you transfer 5,000 SAR, I want you to know: after this transaction your balance will be 20,450 SAR — well above your monthly expense average of 3,100 SAR. You have 9 days until salary. This transfer looks financially safe.',
  hello: 'Good morning! I am Nabeh AI, your intelligent financial companion. I can analyze your spending, predict your future balance, find savings opportunities, and protect you from fraud. What would you like to explore today?',
  default: 'I understand your question. Based on your financial profile, I can see you have strong saving habits and consistent income. Your financial health score of 91% reflects excellent money management. Would you like me to give you personalized recommendations to reach your financial goals faster?',
};

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.match(/spend|expens|budget/)) return AI_RESPONSES.spending;
  if (lower.match(/sav|goal|fund/)) return AI_RESPONSES.saving;
  if (lower.match(/invest|gold|stock/)) return AI_RESPONSES.invest;
  if (lower.match(/balance|how much|money/)) return AI_RESPONSES.balance;
  if (lower.match(/fraud|suspicious|steal|hack/)) return AI_RESPONSES.fraud;
  if (lower.match(/transfer|send|pay/)) return AI_RESPONSES.transfer;
  if (lower.match(/hi|hello|hey|morning/)) return AI_RESPONSES.hello;
  return AI_RESPONSES.default;
}

const INSIGHT_COLORS = {
  saving: '#10b981',
  prediction: '#3b82f6',
  subscription: '#f59e0b',
  fraud: '#ef4444',
} as const;

const INSIGHT_ICONS = {
  saving: 'trending-up',
  prediction: 'bar-chart-2',
  subscription: 'refresh-cw',
  fraud: 'alert-triangle',
} as const;

function ProactiveCard({
  type,
  title,
  message,
}: {
  type: keyof typeof INSIGHT_COLORS;
  title: string;
  message: string;
}) {
  const colors = useColors();
  const color = INSIGHT_COLORS[type];
  const icon = INSIGHT_ICONS[type];

  function onPress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (type === 'fraud') router.push('/fraud-alert');
  }

  return (
    <TouchableOpacity
      style={[styles.proCard, { backgroundColor: colors.card, borderColor: color + '40' }]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      <View style={[styles.proCardIcon, { backgroundColor: color + '20' }]}>
        <Feather name={icon} size={15} color={color} />
      </View>
      <View style={styles.proCardText}>
        <Text style={[styles.proCardTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.proCardMsg, { color: colors.mutedForeground }]} numberOfLines={1}>
          {message}
        </Text>
      </View>
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

function MsgBubble({ msg }: { msg: Message }) {
  const colors = useColors();
  const isAI = msg.role === 'ai';

  if (isAI) {
    return (
      <View style={styles.aiMsgRow}>
        <View style={styles.aiAvatar}>
          <Feather name="zap" size={12} color="#c9a84c" />
        </View>
        <View style={[styles.aiBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.aiBubbleText, { color: colors.foreground }]}>{msg.content}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.userMsgRow}>
      <LinearGradient colors={['#d4a843', '#8b6914']} style={styles.userBubble} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <Text style={styles.userBubbleText}>{msg.content}</Text>
      </LinearGradient>
    </View>
  );
}

function TypingIndicator() {
  const colors = useColors();
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    function anim(dot: Animated.Value, delay: number) {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -5, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ])
      );
    }
    const a1 = anim(dot1, 0);
    const a2 = anim(dot2, 200);
    const a3 = anim(dot3, 400);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  return (
    <View style={styles.aiMsgRow}>
      <View style={styles.aiAvatar}>
        <Feather name="zap" size={12} color="#c9a84c" />
      </View>
      <View style={[styles.typingBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Animated.View style={[styles.typingDot, { backgroundColor: colors.mutedForeground, transform: [{ translateY: dot1 }] }]} />
        <Animated.View style={[styles.typingDot, { backgroundColor: colors.mutedForeground, transform: [{ translateY: dot2 }] }]} />
        <Animated.View style={[styles.typingDot, { backgroundColor: colors.mutedForeground, transform: [{ translateY: dot3 }] }]} />
      </View>
    </View>
  );
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '0',
    role: 'ai',
    content: 'Good morning, Ahmed! I noticed your savings increased by 18% this month. Great progress toward your car fund goal.\n\nI also detected 1 unusual activity that needs your attention. How can I help you today?',
    timestamp: new Date(),
  },
];

export default function AIScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const { insights } = useBank();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [userMsg, ...prev]);
    setIsTyping(true);

    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'ai',
      content: getAIResponse(text),
      timestamp: new Date(),
    };
    setIsTyping(false);
    setMessages(prev => [aiMsg, ...prev]);
  }, [input]);

  const paddingTop = Platform.OS === 'web' ? 67 + 16 : insets.top + 16;
  const paddingBottom = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#080d18', '#0d1830']}
        style={[styles.header, { paddingTop }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.aiInfo}>
            <LinearGradient colors={['#d4a843', '#8b6914']} style={styles.aiLogo}>
              <Feather name="zap" size={18} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={[styles.aiName, { color: colors.foreground }]}>Nabeh AI</Text>
              <View style={styles.onlineRow}>
                <View style={[styles.onlineDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.onlineText, { color: colors.success }]}>Active · Monitoring your account</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={[styles.headerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="more-horizontal" size={18} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Proactive insights scroll */}
        <FlatList
          data={insights}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={i => i.id}
          contentContainerStyle={styles.proScroll}
          renderItem={({ item }) => (
            <ProactiveCard type={item.type} title={item.title} message={item.message} />
          )}
          style={styles.proList}
        />
      </LinearGradient>

      {/* Chat */}
      <KeyboardAvoidingView
        style={styles.chatWrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          data={messages}
          inverted
          keyExtractor={m => m.id}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={isTyping ? <TypingIndicator /> : null}
          renderItem={({ item }) => <MsgBubble msg={item} />}
        />

        {/* Quick suggestions */}
        <View style={[styles.suggestions, { borderTopColor: colors.border }]}>
          <FlatList
            data={['Show spending', 'Balance forecast', 'Investment tips', 'Fraud status']}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={s => s}
            contentContainerStyle={styles.suggestionsScroll}
            renderItem={({ item: suggestion }) => (
              <TouchableOpacity
                style={[styles.suggestionChip, { backgroundColor: colors.accent, borderColor: colors.border }]}
                onPress={() => { setInput(suggestion); }}
                activeOpacity={0.75}
              >
                <Text style={[styles.suggestionText, { color: colors.primary }]}>{suggestion}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Input */}
        <View
          style={[
            styles.inputRow,
            {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
              paddingBottom: Math.max(paddingBottom, 8) + 8,
            },
          ]}
        >
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.accent, color: colors.foreground, borderColor: colors.border }]}
            placeholder="Ask Nabeh AI anything..."
            placeholderTextColor={colors.mutedForeground}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!input.trim() || isTyping}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={input.trim() ? ['#d4a843', '#8b6914'] : [colors.border, colors.border]}
              style={styles.sendBtn}
            >
              <Feather name="send" size={17} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingBottom: 0 },
  headerContent: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 16,
  },
  aiInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  aiLogo: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  aiName: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot: { width: 6, height: 6, borderRadius: 3 },
  onlineText: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  headerBtn: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  proList: { marginBottom: 12 },
  proScroll: { paddingHorizontal: 20, gap: 10, paddingBottom: 4 },
  proCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, width: 280,
  },
  proCardIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  proCardText: { flex: 1 },
  proCardTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  proCardMsg: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 },
  chatWrapper: { flex: 1 },
  chatContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 12, flexGrow: 1, justifyContent: 'flex-end' },
  aiMsgRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  aiAvatar: {
    width: 30, height: 30, borderRadius: 10,
    backgroundColor: 'rgba(201,168,76,0.15)',
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.3)',
    alignItems: 'center', justifyContent: 'center',
    marginTop: 2,
  },
  aiBubble: {
    flex: 1, borderRadius: 16, borderTopLeftRadius: 4,
    padding: 14, borderWidth: 1,
  },
  aiBubbleText: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 21 },
  userMsgRow: { alignItems: 'flex-end' },
  userBubble: { maxWidth: '80%', borderRadius: 16, borderTopRightRadius: 4, padding: 14 },
  userBubbleText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#fff', lineHeight: 20 },
  typingBubble: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 16, borderTopLeftRadius: 4, padding: 14, borderWidth: 1,
  },
  typingDot: { width: 7, height: 7, borderRadius: 3.5 },
  suggestions: { borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: 10 },
  suggestionsScroll: { paddingHorizontal: 16, gap: 8 },
  suggestionChip: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 7 },
  suggestionText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 16, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth,
  },
  textInput: {
    flex: 1, borderRadius: 16, borderWidth: 1,
    paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 15, fontFamily: 'Inter_400Regular',
    maxHeight: 100,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
