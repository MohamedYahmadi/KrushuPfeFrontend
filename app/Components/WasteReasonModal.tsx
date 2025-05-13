import React, { useState, useEffect } from 'react';
        import {
            Modal,
            View,
            Text,
            TextInput,
            TouchableOpacity,
            StyleSheet,
            ActivityIndicator,
            Alert,
            KeyboardAvoidingView,
            ScrollView,
            Platform,
        } from 'react-native';
        import { SelectList } from 'react-native-dropdown-select-list';

        const WasteReasonModal = ({
            visible,
            onClose,
            onSubmit,
            isAdding,
            departments,
            userRole,
        }) => {
            const [reason, setReason] = useState('');
            const [selectedDept, setSelectedDept] = useState('');

            useEffect(() => {
                if (departments.length > 0 && userRole === 'ADMIN') {
                    setSelectedDept(departments[0]);
                }
            }, [departments, userRole]);

            const handleSubmit = () => {
                if (!reason.trim() || reason.trim().length < 3) {
                    Alert.alert('Error', 'Reason must be at least 3 characters');
                    return;
                }

                if (userRole === 'ADMIN' && !selectedDept) {
                    Alert.alert('Error', 'Please select a department');
                    return;
                }

                onSubmit(reason.trim(), selectedDept);
                setReason('');
            };

            return (
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={visible}
                    onRequestClose={onClose}
                >
                    <KeyboardAvoidingView
                        style={styles.modalContainer}
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    >
                        <ScrollView contentContainerStyle={styles.scrollContent}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Add Waste Reason</Text>

                                {userRole === 'ADMIN' && (
                                    <View style={styles.pickerContainer}>
                                        <SelectList
                                            setSelected={(val) => setSelectedDept(val)}
                                            data={departments.map((dept) => ({
                                                key: dept,
                                                value: dept,
                                            }))}
                                            save="value"
                                            placeholder="Select department"
                                            boxStyles={styles.selectBox}
                                            inputStyles={styles.selectInput}
                                            dropdownStyles={styles.selectDropdown}
                                            defaultOption={{
                                                key: selectedDept,
                                                value: selectedDept,
                                            }}
                                        />
                                    </View>
                                )}

                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter waste reason..."
                                    placeholderTextColor="#95A5A6"
                                    value={reason}
                                    onChangeText={setReason}
                                    multiline
                                    numberOfLines={3}
                                />

                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity
                                        style={[styles.button, styles.cancelButton]}
                                        onPress={onClose}
                                        disabled={isAdding}
                                    >
                                        <Text style={styles.buttonText}>Cancel</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.button, styles.submitButton]}
                                        onPress={handleSubmit}
                                        disabled={isAdding}
                                    >
                                        {isAdding ? (
                                            <ActivityIndicator size="small" color="white" />
                                        ) : (
                                            <Text style={styles.buttonText}>Submit</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </Modal>
            );
        };

        const styles = StyleSheet.create({
            modalContainer: {
                flex: 1,
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)',
            },
            scrollContent: {
                flexGrow: 1,
                justifyContent: 'center',
                alignItems: 'center',
            },
            modalContent: {
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 20,
                width: '90%',
            },
            modalTitle: {
                fontSize: 18,
                fontWeight: '600',
                color: '#2C3E50',
                marginBottom: 16,
                textAlign: 'center',
            },
            pickerContainer: {
                marginBottom: 16,
            },
            selectBox: {
                borderWidth: 1,
                borderColor: '#ECF0F1',
                borderRadius: 8,
            },
            selectInput: {
                fontSize: 14,
                color: '#2C3E50',
            },
            selectDropdown: {
                borderWidth: 1,
                borderColor: '#ECF0F1',
                borderRadius: 8,
                marginTop: 5,
            },
            input: {
                borderWidth: 1,
                borderColor: '#ECF0F1',
                borderRadius: 8,
                padding: 12,
                minHeight: 100,
                textAlignVertical: 'top',
                marginBottom: 16,
            },
            buttonContainer: {
                flexDirection: 'row',
                justifyContent: 'space-between',
            },
            button: {
                flex: 1,
                padding: 12,
                borderRadius: 8,
                justifyContent: 'center',
                alignItems: 'center',
                marginHorizontal: 4,
            },
            cancelButton: {
                backgroundColor: '#E74C3C',
            },
            submitButton: {
                backgroundColor: '#4A6FA5',
            },
            buttonText: {
                color: 'white',
                fontWeight: '600',
            },
        });

        export default WasteReasonModal;