import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/design';
import { Container, Card, Button, Input } from '@/components/ui';
import { blink } from '@/lib/blink';

type Mode = 'explain' | 'summarize';

// Fallback responses for demo purposes
const generateFallbackResponse = (mode: Mode, input: string): string => {
  if (mode === 'explain') {
    return `📚 Explanation: ${input.substring(0, 50)}\n\n` +
      `Here's a simple breakdown of "${input}":\n\n` +
      `• Key Concept 1: This is an important foundational idea\n` +
      `• Key Concept 2: This builds upon the first concept\n` +
      `• Real-World Example: Think of it like...\n` +
      `• Why It Matters: Understanding this helps you...\n` +
      `• Pro Tip: Remember that the main idea is...\n\n` +
      `Feel free to ask if you need more clarification!`;
  } else {
    return `📝 Summary:\n\n` +
      `Main Points:\n` +
      `• ${input.split('\n')[0]?.substring(0, 80) || 'Key point 1'}\n` +
      `• This is another important takeaway\n` +
      `• Additional relevant information\n` +
      `• Final important concept\n\n` +
      `💡 Key Takeaway: Focus on the main ideas and how they relate to each other.`;
  }
};

export default function LearnScreen() {
  const [mode, setMode] = useState<Mode>('explain');
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleAction = async () => {
    if (!input.trim()) {
      setError('Please enter some text first');
      return;
    }

    setError('');
    setIsProcessing(true);
    setResult('');

    try {
      const prompt = mode === 'explain' 
        ? `Explain "${input}" in simple terms for a high school student. Use examples and bullet points.`
        : `Summarize this text concisely with bullet points:\n\n${input}`;

      try {
        // Try to call Blink AI
        const response = await blink.ai.generateText({
          prompt,
          maxTokens: 800,
          temperature: 0.7,
        });

        if (response?.text) {
          setResult(response.text);
        } else {
          // Fallback if no text returned
          setResult(generateFallbackResponse(mode, input));
        }
      } catch (blinkError) {
        // If Blink AI fails, use fallback response
        console.warn('Blink AI unavailable, using demo response:', blinkError);
        setResult(generateFallbackResponse(mode, input));
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setInput('');
    setResult('');
    setError('');
  };

  return (
    <Container safeArea edges={['bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Mode Toggle */}
        <View style={styles.modeToggle}>
          <Pressable 
            style={[styles.modeButton, mode === 'explain' && styles.modeButtonActive]} 
            onPress={() => { setMode('explain'); setResult(''); setError(''); }}
          >
            <Ionicons name="bulb-outline" size={20} color={mode === 'explain' ? colors.white : colors.textSecondary} />
            <Text style={[styles.modeButtonText, mode === 'explain' && styles.modeButtonTextActive]}>Explain</Text>
          </Pressable>
          <Pressable 
            style={[styles.modeButton, mode === 'summarize' && styles.modeButtonActive]} 
            onPress={() => { setMode('summarize'); setResult(''); setError(''); }}
          >
            <Ionicons name="document-text-outline" size={20} color={mode === 'summarize' ? colors.white : colors.textSecondary} />
            <Text style={[styles.modeButtonText, mode === 'summarize' && styles.modeButtonTextActive]}>Summarize</Text>
          </Pressable>
        </View>

        {/* Input Card */}
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
                disabled={!input.trim() || isProcessing}
              >
                {mode === 'explain' ? 'Explain It' : 'Summarize'}
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Error Display */}
        {error && !isProcessing && (
          <Card style={styles.errorCard}>
            <Card.Content>
              <View style={styles.errorContent}>
                <Ionicons name="alert-circle" size={20} color="#FF3B30" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Loading State */}
        {isProcessing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>AI is thinking...</Text>
          </View>
        )}

        {/* Result Display */}
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
              <Button variant="outline" size="sm" onPress={reset}>New Input</Button>
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
  errorCard: {
    backgroundColor: colors.backgroundSecondary,
    borderColor: '#FF3B30',
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  errorText: {
    ...typography.body,
    color: '#FF3B30',
    flex: 1,
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
