import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Modal, Pressable } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/design';
import { Container, Card, Button, Input } from '@/components/ui';
import { blink } from '@/lib/blink';

export default function TasksScreen() {
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newDifficulty, setNewDifficulty] = useState(3);
  const [isPrioritizing, setIsPrioritizing] = useState(false);

  const { data: tasks, isLoading: tasksLoading, refetch: refetchTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => blink.db.tasks.list({ sort: { priority: 'asc', deadline: 'asc' } }),
  });

  const addTaskMutation = useMutation({
    mutationFn: async () => {
      const id = Math.random().toString(36).substr(2, 9);
      await blink.db.tasks.create({
        id,
        user_id: 'demo-user',
        title: newTitle,
        deadline: newDeadline,
        difficulty: newDifficulty,
        status: 'pending',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setModalVisible(false);
      setNewTitle('');
      setNewDeadline('');
      setNewDifficulty(3);
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      await blink.db.tasks.update({
        id,
        status: 'completed',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      await blink.db.tasks.remove({ id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const prioritizeWithAIMutation = useMutation({
    mutationFn: async () => {
      setIsPrioritizing(true);
      const pendingTasks = tasks?.filter(t => t.status === 'pending') || [];
      if (pendingTasks.length === 0) return;

      const { object } = await blink.ai.generateObject({
        prompt: `Based on these tasks for a high school student, assign a numerical priority (1 being highest) to each. Consider difficulty (1-5) and deadline.

Tasks: ${JSON.stringify(pendingTasks.map(t => ({ id: t.id, title: t.title, difficulty: t.difficulty, deadline: t.deadline })))}`,
        schema: {
          type: 'object',
          properties: {
            priorities: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  priority: { type: 'number' }
                },
                required: ['id', 'priority']
              }
            }
          },
          required: ['priorities']
        }
      });

      // Update all tasks with new priority
      for (const p of (object as any).priorities) {
        await blink.db.tasks.update({
          id: p.id,
          priority: p.priority,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsPrioritizing(false);
    },
    onError: () => setIsPrioritizing(false),
  });

  return (
    <Container safeArea edges={['bottom']}>
      <View style={styles.header}>
        <Button 
          variant="primary" 
          onPress={() => setModalVisible(true)}
          style={styles.addButton}
          leftIcon={<Ionicons name="add" size={20} color={colors.white} />}
        >
          Add Task
        </Button>
        <Button 
          variant="outline" 
          onPress={() => prioritizeWithAIMutation.mutate()}
          loading={isPrioritizing}
          style={styles.prioritizeButton}
          leftIcon={<Ionicons name="flash" size={20} color={colors.primary} />}
        >
          AI Prioritize
        </Button>
      </View>

      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={tasksLoading} onRefresh={refetchTasks} tintColor={colors.primary} />
        }
      >
        <View style={styles.listContainer}>
          {tasks?.map((task: any) => (
            <Card key={task.id} style={[styles.taskCard, task.status === 'completed' && styles.completedCard]}>
              <Card.Content style={styles.taskCardContent}>
                <Pressable 
                  style={styles.checkbox} 
                  onPress={() => task.status === 'pending' && completeTaskMutation.mutate(task.id)}
                >
                  <Ionicons 
                    name={task.status === 'completed' ? "checkbox" : "square-outline"} 
                    size={24} 
                    color={task.status === 'completed' ? colors.success : colors.textSecondary} 
                  />
                </Pressable>

                <View style={styles.taskInfo}>
                  <Text style={[styles.taskTitle, task.status === 'completed' && styles.completedText]}>
                    {task.title}
                  </Text>
                  <View style={styles.taskMeta}>
                    {task.priority > 0 && (
                      <View style={styles.priorityBadge}>
                        <Text style={styles.priorityText}>#{task.priority}</Text>
                      </View>
                    )}
                    <Text style={styles.taskDeadline}>{task.deadline}</Text>
                  </View>
                </View>

                <Pressable onPress={() => deleteTaskMutation.mutate(task.id)}>
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </Pressable>
              </Card.Content>
            </Card>
          ))}

          {(!tasks || tasks.length === 0) && !tasksLoading && (
            <Text style={styles.noTasks}>No tasks found. Add your first task!</Text>
          )}
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalContent}>
            <Card.Header>
              <Text style={styles.modalTitle}>New Study Task</Text>
            </Card.Header>
            <Card.Content>
              <Input
                label="Task Title"
                placeholder="e.g., Biology Chapter 3 Homework"
                value={newTitle}
                onChangeText={setNewTitle}
                containerStyle={styles.modalInput}
              />
              <Input
                label="Deadline"
                placeholder="YYYY-MM-DD"
                value={newDeadline}
                onChangeText={setNewDeadline}
                containerStyle={styles.modalInput}
              />
              <Text style={styles.difficultyLabel}>Difficulty: {newDifficulty}</Text>
              <View style={styles.difficultyContainer}>
                {[1, 2, 3, 4, 5].map(d => (
                  <Pressable 
                    key={d} 
                    style={[styles.diffButton, newDifficulty === d && styles.diffButtonActive]}
                    onPress={() => setNewDifficulty(d)}
                  >
                    <Text style={[styles.diffButtonText, newDifficulty === d && styles.diffButtonTextActive]}>{d}</Text>
                  </Pressable>
                ))}
              </View>
            </Card.Content>
            <Card.Footer style={styles.modalFooter}>
              <Button variant="ghost" onPress={() => setModalVisible(false)}>Cancel</Button>
              <Button 
                variant="primary" 
                onPress={() => addTaskMutation.mutate()}
                disabled={!newTitle || addTaskMutation.isPending}
              >
                Create
              </Button>
            </Card.Footer>
          </Card>
        </View>
      </Modal>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDarkMode,
  },
  addButton: {
    flex: 1,
  },
  prioritizeButton: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.primary,
  },
  listContainer: {
    paddingBottom: 40,
  },
  taskCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.borderDarkMode,
    borderWidth: 1,
  },
  taskCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  checkbox: {
    padding: 4,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: 4,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  priorityBadge: {
    backgroundColor: colors.accent + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  priorityText: {
    ...typography.tiny,
    color: colors.accent,
    fontWeight: '700',
  },
  taskDeadline: {
    ...typography.small,
    color: colors.textSecondary,
  },
  completedCard: {
    opacity: 0.5,
    backgroundColor: colors.backgroundTertiary,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  noTasks: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlayDark,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.backgroundSecondary,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
  },
  modalInput: {
    marginBottom: spacing.md,
  },
  difficultyLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  diffButton: {
    flex: 1,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDarkMode,
  },
  diffButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  diffButtonText: {
    ...typography.bodyBold,
    color: colors.textSecondary,
  },
  diffButtonTextActive: {
    color: colors.white,
  },
  modalFooter: {
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
});
