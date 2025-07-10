// views/home/HomeScreen.tsx
import React, {useEffect, useRef, useState} from 'react';
import {
    StyleSheet,
    View,
    SafeAreaView,
    Animated,
    Image,
    Platform,
    StatusBar as RNStatusBar,
    RefreshControl
} from 'react-native';
import {
    Text,
    Button,
    useTheme,
    ActivityIndicator,
    IconButton,
    Snackbar,
} from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { storage } from '../../utils/storage';
import { useDashboardViewModel } from '../../viewmodels/DashboardViewModel';
import { useLoginViewModel } from '../../viewmodels/LoginViewModel';
import RouterCard from './components/RouterCard';
import ConnectedDevicesCard from './components/ConnectedDevicesCard';
import DowndetectorCard from './components/DowndetectorCard';
import LatencyCard from './components/LatencyCard';
import CompanySelector from './components/CompanySelector';
import { useCallback } from 'react';

// Configurações de altura do header
const HEADER_MAX_HEIGHT = 150;
const HEADER_MIN_HEIGHT = 80;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

// Logo placeholder
const APP_LOGO = require('../../../assets/images/react-logo.png');

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation<HomeScreenNavigationProp>();

    const {
        userValidationStatus,
        error: loginError,
        user,
        loadAndValidateCurrentUser,
    } = useLoginViewModel();

    const {
        companies,
        selectedCompany,
        changeCompany,
        dashboardData,
        routers,
        externalServicesStatus,
        pingLatencyMetrics,
        connectedDevicesCount,
        loading: dashboardLoading,
        error: dashboardError,
        refreshing,
        loadDashboard,
        refreshDashboard
    } = useDashboardViewModel(user?.companies || []);

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // Animação para o scroll
    const scrollY = useRef(new Animated.Value(0)).current;

    // Animações para o header
    const headerHeight = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
        extrapolate: 'clamp',
    });

    // Posição vertical do conteúdo do header
    const headerContentPadding = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [16, 8], // Menos padding quando comprimido
        extrapolate: 'clamp',
    });

    // Tamanho da logo
    const logoSize = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [48, 36], // Logo diminui de tamanho
        extrapolate: 'clamp',
    });

    const headerTitleOpacity = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
        outputRange: [1, 0.5, 1],
        extrapolate: 'clamp',
    });

    const headerTitleSize = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [24, 20], // Tamanho do texto diminui
        extrapolate: 'clamp',
    });

    // Animação para o conteúdo (sobe quando rola)
    const contentTranslateY = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [0, -HEADER_SCROLL_DISTANCE],
        extrapolate: 'clamp',
    });

    // Animação para borda arredondada
    const borderRadius = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [20, 0],
        extrapolate: 'clamp',
    });

    // Effect to handle post-login validation status
    useFocusEffect(
        useCallback(() => {
            // If we land on HomeScreen and user data hasn't been validated yet
            if (userValidationStatus === 'pending' && !dashboardLoading && !dashboardError) {
                // Trigger the user validation process
                loadAndValidateCurrentUser();
            } else if (userValidationStatus === 'blocked_admin') {
                setSnackbarMessage(loginError || 'Sua conta possui apenas o papel de Administrador. Acesse o sistema pela versão web.');
                setSnackbarVisible(true);
            } else if (userValidationStatus === 'no_companies') {
                setSnackbarMessage(loginError || 'Você não está associado a nenhuma empresa. Por favor, entre em contato com o administrador do sistema.');
                setSnackbarVisible(true);
            } else if (userValidationStatus === 'ok_to_proceed') {
                // Se temos um usuário validado mas não temos dados de dashboard,
                // e temos uma empresa selecionada, carregamos o dashboard
                if (!dashboardData && selectedCompany) {
                    loadDashboard();
                }
            }
        }, [userValidationStatus, loginError, dashboardData, selectedCompany, loadDashboard, loadAndValidateCurrentUser])
    );

    const handleLogout = async () => {
        // Limpar dados de autenticação
        await storage.clearAuth();

        // Navegar para a tela de login
        navigation.navigate('Login');
    };

    // Renderizar cards em grade
    const renderRouterGrid = () => {
        if (!routers || routers.length === 0) {
            return (
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyText}>Nenhum router encontrado para esta empresa.</Text>
                </View>
            );
        }
        return (
            <View style={styles.cardsGrid}>
                {routers.map((router) => (
                    <RouterCard key={router.id.toString()} router={router} />
                ))}
            </View>
        );
    };

    // Renderizar conteúdo principal
    const renderContent = () => {
        if (userValidationStatus === 'pending') {
            return (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Verificando permissões do usuário...</Text>
                </View>
            );
        }

        if (userValidationStatus === 'blocked_admin') {
            return (
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>
                        Sua conta possui apenas o papel de Administrador.
                    </Text>
                    <Text style={styles.errorText}>
                        Por favor, acesse o sistema pela versão web.
                    </Text>
                    <Button
                        mode="contained"
                        onPress={handleLogout}
                        style={styles.retryButton}
                    >
                        Voltar para o Login
                    </Button>
                </View>
            );
        }

        if (dashboardLoading) {
            return (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Carregando dashboard...</Text>
                </View>
            );
        }

        if (dashboardError) {
            return (
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>{dashboardError}</Text>
                    <Button
                        mode="contained"
                        onPress={() => loadDashboard()}
                        style={styles.retryButton}
                    >
                        Tentar novamente
                    </Button>
                </View>
            );
        }

        return (
            <>
                {renderRouterGrid()}
                <ConnectedDevicesCard connectedDevicesCount={connectedDevicesCount} />
                <DowndetectorCard serviceStatus={externalServicesStatus} />
                <LatencyCard pingLatencyMetrics={pingLatencyMetrics} />
                {/* Espaço extra para garantir que o scroll funcione */}
                <View style={{ height: 100 }} />
            </>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />

            {/* Header fixo */}
            <Animated.View style={[
                styles.header,
                {
                    height: headerHeight,
                    backgroundColor: theme.colors.primary
                }
            ]}>
                <Animated.View style={[
                    styles.headerContent,
                    {
                        paddingVertical: headerContentPadding,
                        paddingHorizontal: 16
                    }
                ]}>
                    <View style={styles.titleContainer}>
                        <Animated.Image
                            source={APP_LOGO}
                            style={[
                                styles.logo,
                                {
                                    width: logoSize,
                                    height: logoSize
                                }
                            ]}
                            resizeMode="contain"
                        />
                        <Animated.Text
                            style={[
                                styles.title,
                                {
                                    opacity: headerTitleOpacity,
                                    fontSize: headerTitleSize
                                }
                            ]}
                        >
                            FullConnect
                        </Animated.Text>
                    </View>

                    <View style={styles.headerActions}>
                        {/* Novo: Seletor de Empresa */}
                        {userValidationStatus === 'ok_to_proceed' && companies && companies.length > 0 && (
                            <CompanySelector
                                companies={companies}
                                selectedCompany={selectedCompany}
                                onCompanyChange={changeCompany}
                                disabled={dashboardLoading}
                            />
                        )}

                        {userValidationStatus !== 'blocked_admin' && (
                            <IconButton
                                icon="logout"
                                iconColor="#fff"
                                size={24}
                                onPress={handleLogout}
                            />
                        )}
                    </View>
                </Animated.View>
            </Animated.View>

            {/* Conteúdo principal com scroll */}
            <Animated.ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                refreshControl={
                    userValidationStatus === 'ok_to_proceed' || userValidationStatus === 'no_companies' ? (
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={refreshDashboard}
                            colors={[theme.colors.primary]}
                            progressViewOffset={HEADER_MAX_HEIGHT}
                        />
                    ) : undefined
                }
            >
                {/* Espaço para o header */}
                <View style={{ height: HEADER_MAX_HEIGHT }} />

                {/* Container do conteúdo */}
                <Animated.View style={[
                    styles.contentContainer,
                    {
                        transform: [{ translateY: contentTranslateY }],
                        borderTopLeftRadius: borderRadius,
                        borderTopRightRadius: borderRadius
                    }
                ]}>
                    {renderContent()}
                </Animated.View>
            </Animated.ScrollView>
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={Snackbar.DURATION_LONG}
                style={{ backgroundColor: theme.colors.errorContainer }}
            >
                <Text style={{ color: theme.colors.onErrorContainer }}>{snackbarMessage}</Text>
            </Snackbar>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3
    },
    headerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        marginRight: 12,
    },
    title: {
        fontWeight: 'bold',
        color: '#fff',
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    contentContainer: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 8,
        paddingTop: 16,
        minHeight: 800,
    },
    centerContainer: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    errorText: {
        color: '#B00020',
        fontSize: 16,
        marginBottom: 16,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 16,
    },
    cardsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
});

export default HomeScreen;