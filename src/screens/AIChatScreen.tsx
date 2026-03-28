import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import {
  getAIChats,
  getAIChat,
  sendAIMessage,
  createAIChat,
  deleteAIChat,
} from "../services/api";
import { useFocusEffect } from "@react-navigation/native";
import { AIChat, AIMessage, AIChatRequest } from "../types";

interface OptimisticMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  chat_id?: number;
  created_at?: string;
}

export default function AIChatScreen() {
  const [chats, setChats] = useState<AIChat[]>([]);
  const [activeChat, setActiveChat] = useState<AIChat | null>(null);
  const [messages, setMessages] = useState<(AIMessage | OptimisticMessage)[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showChatList, setShowChatList] = useState<boolean>(true);

  const fetchChats = async (): Promise<void> => {
    try {
      const { data } = await getAIChats();
      setChats(data || []);
    } catch (error) {
      console.log("AI Chats error:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchChats();
      setShowChatList(true);
      setActiveChat(null);
      setMessages([]);
    }, [])
  );

  const openChat = async (chatId: number): Promise<void> => {
    try {
      const { data } = await getAIChat(chatId);
      setActiveChat(data);
      setMessages(data.messages || []);
      setShowChatList(false);
    } catch (error) {
      console.log("Open chat error:", error);
    }
  };

  const handleNewChat = async (): Promise<void> => {
    setActiveChat(null);
    setMessages([]);
    setShowChatList(false);
  };

  const handleSend = async (): Promise<void> => {
    if (!input.trim()) return;

    const userMessage: string = input.trim();
    setInput("");
    setLoading(true);

    // Optimistic update
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage, id: Date.now() } as OptimisticMessage,
    ]);

    try {
      const payload: AIChatRequest = { message: userMessage };
      if (activeChat?.id) payload.chat_id = activeChat.id;

      const { data } = await sendAIMessage(payload);

      if (!activeChat?.id && data.chat_id) {
        setActiveChat({ id: data.chat_id } as AIChat);
      }

      setMessages((prev) => [...prev, data.message]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Уучлаарай, алдаа гарлаа. Дахин оролдоно уу.",
          id: Date.now() + 1,
        } as OptimisticMessage,
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Chat List View
  if (showChatList) {
    return (
      <View className="flex-1 bg-dark-bg px-5 pt-14">
        <StatusBar style="light" />

        {/* Header with AI icon */}
        <View className="items-center mb-6">
          <View className="w-14 h-14 rounded-full bg-accent-green/20 items-center justify-center mb-3">
            <Ionicons name="sparkles" size={28} color="#00C853" />
          </View>
          <Text className="text-white text-xl font-bold">Тавтай морил</Text>
          <Text className="text-white text-xl font-bold">AI Зөвлөгч</Text>
          <Text className="text-gray-400 text-sm mt-1">
            AI зөвлөгчтэй чатлаж эхлээрэй
          </Text>
        </View>

        {/* New Chat Button */}
        <TouchableOpacity
          className="bg-accent-green py-4 rounded-2xl items-center mb-6"
          onPress={handleNewChat}
        >
          <Text className="text-dark-bg font-bold text-base">Шинэ чат</Text>
        </TouchableOpacity>

        {/* Previous Chats */}
        <Text className="text-gray-400 text-sm mb-3">Сүүлийн 7 хоног</Text>
        <ScrollView className="flex-1">
          {chats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              className="flex-row items-center bg-dark-card rounded-xl p-4 mb-2"
              onPress={() => openChat(chat.id)}
            >
              <Ionicons name="chatbubble-outline" size={16} color="#666" />
              <Text className="text-white text-sm ml-3 flex-1" numberOfLines={1}>
                {chat.title}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  // Chat Messages View
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-dark-bg"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="light" />

      {/* Chat Header */}
      <View className="flex-row items-center px-5 pt-14 pb-3 border-b border-dark-border">
        <TouchableOpacity
          onPress={() => {
            setShowChatList(true);
            fetchChats();
          }}
          className="mr-3"
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Ionicons name="sparkles" size={20} color="#00C853" />
        <Text className="text-white font-bold text-base ml-2">
          AI Санхүүгийн зөвлөгч
        </Text>
      </View>

      {/* Messages */}
      <ScrollView className="flex-1 px-5 py-4">
        {messages.map((msg, index) => (
          <View
            key={msg.id || index}
            className={`mb-4 ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            <View
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-accent-green"
                  : "bg-dark-card"
              }`}
            >
              <Text
                className={`text-sm leading-5 ${
                  msg.role === "user" ? "text-dark-bg" : "text-white"
                }`}
              >
                {msg.content}
              </Text>
            </View>
          </View>
        ))}
        {loading && (
          <View className="items-start mb-4">
            <View className="bg-dark-card rounded-2xl px-4 py-3">
              <ActivityIndicator size="small" color="#00C853" />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View className="px-5 pb-8 pt-3 border-t border-dark-border">
        <View className="flex-row items-center bg-dark-card rounded-2xl px-4 py-2">
          <TextInput
            className="flex-1 text-white text-sm py-2"
            placeholder="Мессеж бичих..."
            placeholderTextColor="#666"
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity
            onPress={handleSend}
            className="ml-2 w-10 h-10 rounded-full bg-accent-green items-center justify-center"
          >
            <Ionicons name="send" size={18} color="#0D0D0D" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
