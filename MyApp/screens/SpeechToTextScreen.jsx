import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { NetworkConfig } from '../utils/NetworkConfig';

const API_BASE = NetworkConfig.API_BASE;

export default function SpeechToTextScreen({ navigation }) {
  const { theme } = useTheme();
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const recordingRef = useRef(null);

  const startRecording = async () => {
    setError(null);
    setTranscript('');
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        setError('Permission to access microphone is required!');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (e) {
      setError('Failed to start recording: ' + e.message);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    try {
      const rec = recordingRef.current;
      if (!rec) return;
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      setRecording(null);
      await uploadAudio(uri);
    } catch (e) {
      setError('Failed to stop recording: ' + e.message);
    }
  };

  const uploadAudio = async (uri) => {
    setIsUploading(true);
    setTranscript('');
    setError(null);
    try {
      // Convert to .wav if needed, but expo-av records as .m4a by default. Backend expects .wav.
      // For demo, try sending as-is, but ideally convert to .wav on backend or use a library to record as .wav.
      const fileInfo = await FileSystem.getInfoAsync(uri);
      const fileName = uri.split('/').pop().replace(/m4a$/, 'wav');
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: fileName,
        type: 'audio/wav', // May need to adjust if backend expects .wav
      });
      const maxRetries = 2;
      let attempt = 0;
      const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
      while (attempt <= maxRetries) {
        try {
          attempt += 1;
          const response = await axios.post(`${API_BASE}/speech-to-text/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 120000,
          });
          setTranscript(response.data.transcript || 'No transcript found.');
          break;
        } catch (err) {
          const status = err.response?.status;
          if (status === 429) {
            const retryAfter = err.response?.data?.detail?.retry_after_seconds || err.response?.headers?.['retry-after'];
            const waitMs = retryAfter ? Math.ceil(Number(retryAfter) * 1000) : Math.min(3000 * attempt, 15000);
            if (attempt <= maxRetries) {
              console.log(`Received 429 on STT upload, retrying after ${waitMs}ms (attempt ${attempt}/${maxRetries})`);
              await sleep(waitMs);
              continue;
            }
            setError('Service is busy. Please try again in a few seconds.');
            break;
          }
          throw err;
        }
      }
    } catch (e) {
      setError('Failed to upload or transcribe audio: ' + (e.response?.data?.detail || e.message));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <StatusBar barStyle={theme.colors.statusBarStyle} backgroundColor={theme.colors.background} />
      <Text style={[styles.title, { color: theme.colors.primary }]}>Speech to Text (Backend)</Text>
      <View style={styles.textContainer}>
        {isUploading ? (
          <ActivityIndicator size="large" color={theme.colors.success} />
        ) : (
          <Text style={[styles.recognizedText, { color: theme.colors.text }]}>{transcript || 'Tap the mic, record, and upload to backend...'}</Text>
        )}
      </View>
      {error && <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>}
      <TouchableOpacity
        style={[styles.micButton, isRecording && { backgroundColor: theme.colors.success }]}
        onPress={isRecording ? stopRecording : startRecording}
        activeOpacity={0.8}
        disabled={isUploading}
      >
        <Ionicons name={isRecording ? 'mic-off' : 'mic'} size={48} color={isRecording ? theme.colors.onPrimary : theme.colors.success} />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.colors.card }]} onPress={() => navigation.goBack()}>
        <Text style={[styles.backButtonText, { color: theme.colors.text }]}>Back</Text>
      </TouchableOpacity>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    color: '#10B981',
    fontWeight: 'bold',
    marginBottom: 32,
  },
  textContainer: {
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  recognizedText: {
    fontSize: 22,
    textAlign: 'center',
  },
  micButton: {
    borderRadius: 50,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  errorText: {
    color: '#f87171',
    marginBottom: 16,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
}); 