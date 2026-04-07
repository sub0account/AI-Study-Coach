import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/design';
import { Container, Card, Button, Input } from '@/components/ui';
import { blink } from '@/lib/blink';

type Mode = 'explain' | 'summarize';

export default function LearnScreen() {
  const [mode, setMode] = useState<Mode>('explain');
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const aiMutation = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);
      setResult('');
      
      const prompt = mode === 'explain' 
        ? `Explain the following topic in simple terms suitable for a Grade 10-12 student. Use examples and bullet points where helpful: ${input}`
        : `Summarize the following study notes concisely, reducing the content by about 50% while keeping all key facts: ${input}`;

      const { text } = await blink.ai.generateText({
        prompt,
        maxTokens: 500,
        temperature: 0.7,
      });
      
      return text;
    },
    onSuccess: (text) => {
      setResult(text);
      setIsProcessing(false);
    },
    onError: () => setIsProcessing(false),
  });

  const handleAction = () => {
    if (!input.trim()) return;
    aiMutation.mutate();
  };

  const reset = () => {
    setInput('');
    setResult('');
  };

  return (
    <Container safeArea edges={['bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.modeToggle}>
          <Pressable 
            style={[styles.modeButton, mode === 'explain' && styles.modeButtonActive]} 
            onPress={() => { setMode('explain'); setResult(''); setInput(''); }}
          >
            <Ionicons name="bulb-outline" size={20} color={mode === 'explain' ? colors.white : colors.textSecondary} />
            <Text style={[styles.modeButtonText, mode === 'explain' && styles.modeButtonTextActive]}>Explain</Text>
          </Pressable>
          <Pressable 
            style={[styles.modeButton, mode === 'summarize' && styles.modeButtonActive]} 
            onPress={() => { setMode('summarize'); setResult(''); setInput(''); }}
          >
            <Ionicons name="document-text-outline" size={20} color={mode === 'summarize' ? colors.white : colors.textSecondary} />
            <Text style={[styles.modeButtonText, mode === 'summarize' && styles.modeButtonTextActive]}>Summarize</Text>
          </Pressable>
        </View>

        <Card style={styles.inputCard}>
          <Card.Content>
            <Text style={styles.label}>
              {mode === 'explain' ? 'Enter a topic to understand:' : 'Paste your long notes here:'}
            </Text>
            <Input
              multiline
              numberOfLines={6}
              placeholder={mode === 'explain' ? "e.g., Photosynthesis, Calculus limits, WWII causes..." : "Paste your text here..."}
              value={input}
              onChangeText={setInput}
              textAlignVertical="top"
              containerStyle={styles.input}
            />
            <View style={styles.actions}>
              <Button variant="ghost" onPress={reset}>Clear</Button>
              <Button 
                variant="primary" 
                onPress={handleAction} 
                loading={isProcessing}
                disabled={!input.trim()}
              >
                {mode === 'explain' ? 'Explain It' : 'Summarize'}
              </Button>
            </View>
          </Card.Content>
        </Card>

        {isProcessing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>AI is thinking...</Text>
          </View>
        )}

        {result && !isProcessing && (
          <Card style={styles.resultCard} variant="elevated">
            <Card.Header>
              <View style={styles.resultHeader}>
                <Ionicons name="sparkles" size={20} color={colors.accent} />
                <Text style={styles.resultTitle}>
                  {mode === 'explain' ? 'Simple Explanation' : 'Smart Summary'}
                </Text>
              </View>
            </Card.Header>
            <Card.Content>
              <Text style={styles.resultText}>{result}</Text>
            </Card.Content>
            <Card.Footer>
              <Button variant="outline" size="sm" onPress={() => {}}>Copy Result</Button>
            </Card.Footer>
          </Card>
        )}
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: 4,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderDarkMode,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    gap: 8,
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
  },
  modeButtonText: {
    ...typography.bodyBold,
    color: colors.textSecondary,
  },
  modeButtonTextActive: {
    color: colors.white,
  },
  inputCard: {
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.borderDarkMode,
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.background,
    borderColor: colors.borderDarkMode,
    borderWidth: 1,
    minHeight: 120,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  resultCard: {
    backgroundColor: colors.backgroundSecondary,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultTitle: {
    ...typography.h3,
    color: colors.text,
  },
  resultText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
  },
});
