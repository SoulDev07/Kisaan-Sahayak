import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, Image, TouchableOpacity, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

// Using the same theme for consistency
const theme = {
    colors: {
        surface: '#1E293B',
        primary: '#34D399',
        text: '#E2E8F0',
        textSecondary: '#94A3B8',
        white: '#FFFFFF',
    },
    spacing: { medium: 16, large: 24 },
    typography: {
        h2: { fontSize: 22, fontWeight: 'bold', color: '#E2E8F0' },
        body: { fontSize: 16, lineHeight: 24, color: '#94A3B8' },
    },
};

export default function FollowUpScreen({ route, navigation }) {
    const { context } = route.params;
    const { t } = useTranslation();

    const handleNavigate = (screen) => {
        // First, go back to dismiss the modal, then navigate.
        navigation.goBack();
        // A short delay ensures the modal is gone before navigating.
        setTimeout(() => {
            navigation.navigate(screen, { context });
        }, 50);
    };

    return (
        <View style={styles.overlay}>
            <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => navigation.goBack()} />
            <Animated.View style={styles.modalContainer}>
                <Text style={styles.title}>{t('followup.title')}</Text>
                <Text style={styles.diseaseName}>{context.diseaseName}</Text>
                
                <Image source={{ uri: context.userImageUri }} style={styles.imagePreview} />
                
                <Text style={styles.prompt}>{t('followup.prompt')}</Text>

                <TouchableOpacity style={styles.button} onPress={() => handleNavigate('VoiceChatInputScreen')}>
                    <Feather name="message-circle" size={22} color={theme.colors.text} />
                    <Text style={styles.buttonText}>{t('followup.start_text_chat')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={() => handleNavigate('LiveVoiceScreen')}>
                    <Feather name="mic" size={22} color={theme.colors.text} />
                    <Text style={styles.buttonText}>{t('followup.start_live_voice_chat')}</Text>
                </TouchableOpacity>

                 <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelButtonText}>{t('followup.cancel')}</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: 24,
        padding: theme.spacing.large,
        width: '90%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    title: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
    },
    diseaseName: {
        ...theme.typography.h2,
        color: theme.colors.primary,
        marginBottom: theme.spacing.medium,
    },
    imagePreview: {
        width: 100,
        height: 100,
        borderRadius: 12,
        marginBottom: theme.spacing.large,
    },
    prompt: {
        ...theme.typography.body,
        marginBottom: theme.spacing.large,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: theme.spacing.medium,
        borderRadius: 12,
        width: '100%',
        marginBottom: theme.spacing.medium,
    },
    buttonText: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: theme.spacing.medium,
    },
    cancelButton: {
        marginTop: theme.spacing.small,
        padding: theme.spacing.medium,
    },
    cancelButtonText: {
        color: theme.colors.textSecondary,
        fontSize: 16,
    }
});