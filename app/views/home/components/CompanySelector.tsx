// views/home/components/CompanySelector.tsx
import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Menu, Divider, Button, IconButton } from 'react-native-paper';
import { Company } from '../../../models/Company';

interface CompanySelectorProps {
    companies: Company[];
    selectedCompany: Company | null;
    onCompanyChange: (company: Company) => void;
    disabled?: boolean;
}

const CompanySelector: React.FC<CompanySelectorProps> = ({
                                                             companies,
                                                             selectedCompany,
                                                             onCompanyChange,
                                                             disabled = false
                                                         }) => {
    const [visible, setVisible] = useState(false);

    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    const handleSelectCompany = (company: Company) => {
        onCompanyChange(company);
        closeMenu();
    };

    if (!selectedCompany) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Menu
                visible={visible && !disabled}
                onDismiss={closeMenu}
                anchor={
                    <TouchableOpacity
                        onPress={openMenu}
                        disabled={disabled}
                        style={[
                            styles.selectorButton,
                            disabled && styles.disabledButton
                        ]}
                    >
                        <Text style={styles.companyName} numberOfLines={1}>
                            {selectedCompany.name}
                        </Text>
                        <IconButton
                            icon="chevron-down"
                            size={20}
                            iconColor="#fff"
                            style={styles.dropdownIcon}
                        />
                    </TouchableOpacity>
                }
            >
                {companies.map((company) => (
                    <Menu.Item
                        key={company.id}
                        onPress={() => handleSelectCompany(company)}
                        title={company.name}
                        style={[
                            styles.menuItem,
                            company.id === selectedCompany.id && styles.selectedMenuItem
                        ]}
                        titleStyle={company.id === selectedCompany.id ? styles.selectedMenuText : styles.menuText}
                        leadingIcon={company.id === selectedCompany.id ? "check" : undefined}
                    />
                ))}
            </Menu>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 8,
    },
    selectorButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 4,
        paddingLeft: 12,
        paddingRight: 4,
        maxWidth: 180,
    },
    disabledButton: {
        opacity: 0.6,
    },
    companyName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
    },
    dropdownIcon: {
        margin: 0,
    },
    menuItem: {
        paddingHorizontal: 16,
    },
    selectedMenuItem: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    menuText: {
        fontSize: 16,
    },
    selectedMenuText: {
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default CompanySelector;