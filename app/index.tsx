import { Client, Account, AppwriteException, OAuthProvider } from "appwrite";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";

const client = new Client()
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID ?? "")
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT ?? "");
const account = new Account(client);

const { width, height } = Dimensions.get("window");

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [checkingUser, setCheckingUser] = useState(true);

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (mode === "signup") {
        await account.create("unique()", email, password);
        Alert.alert("Signup successful! Please login.");
        setMode("login");
      } else {
        await account.createSession(email, password);
        Alert.alert("Login successful!");
      }
    } catch (err) {
      if (err instanceof AppwriteException) {
        Alert.alert(err.message);
      } else {
        Alert.alert("An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // This will redirect to Google OAuth in a browser
      await account.createOAuth2Session(
        OAuthProvider.Google,
        Platform.OS === "web" ? window.location.origin : "appwrite-callback://",
        Platform.OS === "web" ? window.location.origin : "appwrite-callback://",
      );
    } catch (err) {
      if (err instanceof AppwriteException) {
        Alert.alert(err.message);
      } else {
        Alert.alert("Google login failed");
      }
    }
  };

  const handleLogout = async () => {
    await account.deleteSession("current");
    setUser(null);
    setEmail("");
    setPassword("");
    setMode("login");
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await account.get();
        setUser(user);
      } catch (err) {
        setUser(null);
      } finally {
        setCheckingUser(false);
      }
    };
    fetchUser();
  }, []);

  if (checkingUser) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />

      {/* Background Gradient Effect */}
      <View style={styles.backgroundGradient} pointerEvents="none" />

      {/* Floating Elements for Visual Interest */}
      <View style={styles.floatingCircle1} pointerEvents="none" />
      <View style={styles.floatingCircle2} pointerEvents="none" />
      <View style={styles.floatingCircle3} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome Back</Text>
          <Text style={styles.welcomeSubtitle}>
            {mode === "login"
              ? "Sign in to continue to your account"
              : "Create your account to get started"}
          </Text>
        </View>

        {/* Enhanced Card */}
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            {user ? (
              <View style={styles.userInfo}>
                <Text style={styles.userInfoText}>
                  Hello, {user.name || user.email || "User"}!
                </Text>
                <TouchableOpacity
                  onPress={handleLogout}
                  style={styles.logoutButton}
                >
                  <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                {/* Form Header */}
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>
                    {mode === "login" ? "Sign In" : "Create Account"}
                  </Text>
                  <View style={styles.titleUnderline} />
                </View>

                {/* Input Fields */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Email Address</Text>
                    <TextInput
                      style={[
                        styles.input,
                        focusedInput === "email" && styles.inputFocused,
                      ]}
                      placeholder="Enter your email"
                      placeholderTextColor="#9CA3AF"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setFocusedInput("email")}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Password</Text>
                    <TextInput
                      style={[
                        styles.input,
                        focusedInput === "password" && styles.inputFocused,
                      ]}
                      placeholder="Enter your password"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setFocusedInput("password")}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>
                </View>

                {/* Primary Action Button */}
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    loading && styles.buttonDisabled,
                  ]}
                  onPress={handleAuth}
                  disabled={loading}
                >
                  <Text style={styles.primaryButtonText}>
                    {loading
                      ? "Please wait..."
                      : mode === "login"
                        ? "Sign In"
                        : "Create Account"}
                  </Text>
                </TouchableOpacity>

                {/* Mode Switch */}
                <TouchableOpacity
                  style={styles.switchMode}
                  onPress={() => setMode(mode === "login" ? "signup" : "login")}
                >
                  <Text style={styles.switchModeText}>
                    {mode === "login"
                      ? "Don't have an account? "
                      : "Already have an account? "}
                    <Text style={styles.switchModeLink}>
                      {mode === "login" ? "Sign Up" : "Sign In"}
                    </Text>
                  </Text>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <View style={styles.orContainer}>
                    <Text style={styles.orText}>OR</Text>
                  </View>
                  <View style={styles.divider} />
                </View>

                {/* Google Login Button */}
                <TouchableOpacity
                  style={styles.googleButton}
                  onPress={handleGoogleLogin}
                >
                  <View style={styles.googleIcon}>
                    <Text style={styles.googleIconText}>G</Text>
                  </View>
                  <Text style={styles.googleButtonText}>
                    Continue with Google
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#667eea",
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#667eea",
    // Add gradient overlay effect
    opacity: 0.9,
  },
  floatingCircle1: {
    position: "absolute",
    top: height * 0.1,
    right: -50,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  floatingCircle2: {
    position: "absolute",
    top: height * 0.7,
    left: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  floatingCircle3: {
    position: "absolute",
    top: height * 0.3,
    left: width * 0.8,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  welcomeSection: {
    marginBottom: 40,
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 22,
  },
  cardContainer: {
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    marginHorizontal: 4,
    ...Platform.select({
      web: {
        boxShadow: "0px 8px 20px rgba(0,0,0,0.15)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
      },
    }),
    width: "100%",
    maxWidth: 400,
  },
  formHeader: {
    marginBottom: 32,
    alignItems: "center",
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  titleUnderline: {
    width: 40,
    height: 3,
    backgroundColor: "#667eea",
    borderRadius: 2,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
    color: "#1F2937",
  },
  inputFocused: {
    borderColor: "#667eea",
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      web: {
        boxShadow: "0px 0px 0px 2px rgba(102, 126, 234, 0.5)",
      },
      default: {
        shadowColor: "#667eea",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  primaryButton: {
    backgroundColor: "#667eea",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: "0px 4px 8px rgba(102, 126, 234, 0.3)",
      },
      default: {
        shadowColor: "#667eea",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
      },
    }),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  switchMode: {
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 8,
  },
  switchModeText: {
    fontSize: 14,
    color: "#6B7280",
  },
  switchModeLink: {
    color: "#667eea",
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  orContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
  },
  orText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
  },
  googleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4285F4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  googleIconText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  googleButtonText: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "500",
  },
  footer: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: 18,
  },
  userInfo: {
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  userInfoText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
  },
  logoutButton: {
    backgroundColor: "#667eea",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
    marginTop: 16,
    ...Platform.select({
      web: {
        boxShadow: "0px 4px 8px rgba(102, 126, 234, 0.3)",
      },
      default: {
        shadowColor: "#667eea",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
      },
    }),
    color: "#FFFFFF",
    fontSize: 16,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
