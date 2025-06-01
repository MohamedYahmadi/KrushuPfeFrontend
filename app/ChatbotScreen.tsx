import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Animated,
    Easing,
    Pressable,
    Keyboard,
} from 'react-native';
import {MessageCircle, Send, Bot, XCircle} from 'lucide-react-native';
import { useFonts, Inter_600SemiBold, Inter_500Medium, Inter_400Regular } from '@expo-google-fonts/inter';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
}

type ChatbotScreenProps = NativeStackScreenProps<any, any>;

const theme = {
    colors: {
        primary: '#0A84FF',
        primaryDark: '#0071E3',
        primaryLight: '#D6E8FF',
        background: '#FFFFFF',
        card: '#F2F2F7',
        text: '#1C1C1E',
        textSecondary: '#636366',
        textTertiary: '#8E8E93',
        border: '#E5E5EA',
        shadow: '#000000',
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
    },
    borderRadius: {
        sm: 6,
        md: 12,
        lg: 16,
        full: 9999,
    },
};

const ChatbotScreen: React.FC<ChatbotScreenProps> = ({ navigation }) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Hello! I'm your Kroschu assistant. How can I help you today?", sender: 'bot' },
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [fontsLoaded] = useFonts({
        Inter_600SemiBold,
        Inter_500Medium,
        Inter_400Regular,
    });

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                setKeyboardHeight(e.endCoordinates.height);
                setTimeout(() => {
                    if (scrollViewRef.current) {
                        scrollViewRef.current.scrollToEnd({ animated: true });
                    }
                }, 100);
            }
        );

        const keyboardDidHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardHeight(0);
            }
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    useEffect(() => {
        if (isChatOpen) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [isChatOpen]);

    useEffect(() => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.1,
                duration: 300,
                easing: Easing.out(Easing.back(1.5)),
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 200,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start();

        const pulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.05,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );

        setTimeout(() => {
            pulseAnimation.start();
        }, 500);

        return () => {
            pulseAnimation.stop();
        };
    }, []);

    const handleSendMessage = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMessage = {
            id: messages.length + 1,
            text: inputText,
            sender: 'user',
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 300000);

            const response = await fetch('http://172.20.10.5:5000/chat     ', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: inputText }),
                signal: controller.signal,
            });

            clearTimeout(timeout);

            const data = await response.json();

            const botMessage = {
                id: messages.length + 2,
                text: data.response,
                sender: 'bot',
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('Error: Request timed out');
            } else {
                console.error('Error:', error);
            }
            const errorMessage = {
                id: messages.length + 2,
                text: "Sorry, I'm having trouble connecting to the server. Please try again later.",
                sender: 'bot',
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
    };

    useEffect(() => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
    }, [messages, keyboardHeight]);

    if (!fontsLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!isChatOpen) {
        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={toggleChat}
                style={styles.buttonContainer}
            >
                <Animated.View
                    style={[
                        styles.chatButton,
                        {
                            transform: [
                                { scale: scaleAnim },
                                { rotate: rotateAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0deg', '360deg'],
                                    }) },
                            ],
                        },
                    ]}
                >
                    <MessageCircle size={26} color="white" />
                </Animated.View>
            </TouchableOpacity>
        );
    }

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: fadeAnim,
                    height: 600, // Increased height
                    bottom: keyboardHeight > 0 ? keyboardHeight + 10 : 20,
                },
            ]}
        >
            <View style={styles.header}>
                <View style={styles.headerTitle}>
                    <Bot size={24} color={theme.colors.primary} />
                    <Text style={styles.headerText}>Kroschu Assistant</Text>
                </View>
                <Pressable
                    onPress={toggleChat}
                    style={({ pressed }) => [
                        styles.closeButton,
                        pressed && styles.closeButtonPressed,
                    ]}
                >
                    <XCircle size={22} color={theme.colors.textSecondary} />
                </Pressable>
            </View>

            <ScrollView
                ref={scrollViewRef}
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
                keyboardDismissMode="interactive"
            >
                {messages.map((message, index) => (
                    <Animated.View
                        key={message.id}
                        style={[
                            styles.messageBubbleContainer,
                            message.sender === 'user' ? styles.userContainer : styles.botContainer,
                            {
                                opacity: fadeAnim,
                                transform: [
                                    { translateY: fadeAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [50, 0],
                                        }) },
                                ],
                            },
                        ]}
                    >
                        <View
                            style={[
                                styles.messageBubble,
                                message.sender === 'user' ? styles.userBubble : styles.botBubble,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.messageText,
                                    message.sender === 'user' ? styles.userText : styles.botText,
                                ]}
                            >
                                {message.text}
                            </Text>
                        </View>
                    </Animated.View>
                ))}

                {isLoading && (
                    <View style={[styles.loadingBubble]}>
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                    </View>
                )}
            </ScrollView>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <View
                    style={[
                        styles.inputContainer,
                        isFocused && styles.inputContainerFocused,
                    ]}
                >
                    <TextInput
                        style={styles.input}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Type your message..."
                        placeholderTextColor={theme.colors.textTertiary}
                        multiline
                        maxLength={500}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onSubmitEditing={handleSendMessage}
                    />

                    <Pressable
                        onPress={handleSendMessage}
                        disabled={isLoading || !inputText.trim()}
                        style={({ pressed }) => [
                            styles.sendButton,
                            pressed && !isLoading && styles.sendButtonPressed,
                            (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
                        ]}
                    >
                        <Animated.View
                            style={{
                                transform: [
                                    { scale: scaleAnim },
                                    { rotate: rotateAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['0deg', '45deg'],
                                        }) },
                                ],
                            }}
                        >
                            <Send
                                size={22}
                                color={
                                    !inputText.trim() || isLoading
                                        ? theme.colors.textTertiary
                                        : theme.colors.primary
                                }
                            />
                        </Animated.View>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 350,
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.lg,
        shadowColor: theme.colors.shadow,
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 10,
        overflow: 'hidden',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        zIndex: 100,
    },
    chatButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.shadow,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.background,
    },
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    headerText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: theme.spacing.md,
        color: theme.colors.text,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonPressed: {
        backgroundColor: theme.colors.card,
    },
    messagesContainer: {
        flex: 1,
        paddingHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.sm,
    },
    messagesContent: {
        paddingVertical: theme.spacing.md,
    },
    messageBubbleContainer: {
        maxWidth: '80%',
        marginBottom: theme.spacing.md,
    },
    botContainer: {
        alignSelf: 'flex-start',
    },
    userContainer: {
        alignSelf: 'flex-end',
    },
    messageBubble: {
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        shadowColor: theme.colors.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 2,
    },
    botBubble: {
        backgroundColor: theme.colors.card,
        borderBottomLeftRadius: 4,
    },
    userBubble: {
        backgroundColor: theme.colors.primary,
        borderBottomRightRadius: 4,
    },
    messageText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 14,
        lineHeight: 20,
    },
    botText: {
        color: theme.colors.text,
    },
    userText: {
        color: '#FFFFFF',
    },
    loadingBubble: {
        alignSelf: 'flex-start',
        backgroundColor: theme.colors.card,
        padding: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
        borderBottomLeftRadius: 4,
        marginBottom: theme.spacing.md,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.sm,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        backgroundColor: theme.colors.background,
    },
    inputContainerFocused: {
        borderTopColor: theme.colors.primary,
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 120,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.full,
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: theme.colors.text,
    },
    sendButton: {
        marginLeft: theme.spacing.sm,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonPressed: {
        backgroundColor: theme.colors.primaryLight,
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ChatbotScreen;