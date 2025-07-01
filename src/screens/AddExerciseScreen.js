// src/screens/AddExerciseScreen.js
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Appbar, Text } from 'react-native-paper';
import { getExercises, saveExercises } from '../utils/storage';
import { colors } from '../theme/colors';

const AddExerciseScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSaveExercise = async () => {
    if (!name.trim()) {
      Alert.alert('Ошибка', 'Название упражнения не может быть пустым.');
      return;
    }

    const newExercise = {
      id: Date.now().toString(), // Простой уникальный ID
      name: name.trim(),
      description: description.trim(),
    };

    const existingExercises = await getExercises();
    const updatedExercises = [...existingExercises, newExercise];
    await saveExercises(updatedExercises);

    Alert.alert('Успех', 'Упражнение добавлено!', [
      { text: 'ОК', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color={colors.onPrimary} />
        <Appbar.Content title="Добавить Упражнение" titleStyle={styles.appBarTitle} />
      </Appbar.Header>

      <View style={styles.form}>
        <TextInput
          label="Название упражнения"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
          theme={{ colors: { primary: colors.primary, underlineColor: 'transparent' } }}
        />
        <TextInput
          label="Описание (необязательно)"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.input}
          theme={{ colors: { primary: colors.primary, underlineColor: 'transparent' } }}
        />
        <Button
          mode="contained"
          onPress={handleSaveExercise}
          style={styles.saveButton}
          labelStyle={styles.saveButtonLabel}
        >
          Сохранить упражнение
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  appBar: {
    backgroundColor: colors.primary,
  },
  appBarTitle: {
    color: colors.onPrimary,
  },
  form: {
    padding: 20,
  },
  input: {
    marginBottom: 15,
    backgroundColor: colors.surface,
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingVertical: 8,
  },
  saveButtonLabel: {
    fontSize: 16,
  },
});

export default AddExerciseScreen;