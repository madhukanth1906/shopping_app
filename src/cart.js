import { getCurrentUser, loginWithGoogle } from './lib/auth.js';
import { databases, CUSTOMERS_COLLECTION_ID, DATABASE_ID, ID, Query } from './lib/appwrite.js';

document.addEventListener('DOMContentLoaded', async () => {
    const btnProceedCheckout = document.getElementById('btn-proceed-checkout');
    const checkoutView = document.getElementById('checkout-view');
    const btnSaveAddress = document.getElementById('btn-save-address');
    
    const inputName = document.getElementById('shipping-name');
    const inputAddress = document.getElementById('shipping-address');
    const inputCity = document.getElementById('shipping-city');
    const inputPostal = document.getElementById('shipping-postal');
    
    let currentUser = await getCurrentUser();
    let customerDocId = null;

    // Check if we arrived here after a successful login flow
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('checkout') === 'true' && currentUser) {
        showCheckoutView();
        await loadCustomerAddress();
    }

    btnProceedCheckout.addEventListener('click', async () => {
        if (!currentUser) {
            // Initiate login and redirect back to this page with checkout=true
            const redirectUrl = window.location.origin + '/cart.html?checkout=true';
            loginWithGoogle(redirectUrl);
        } else {
            showCheckoutView();
            await loadCustomerAddress();
        }
    });

    if (btnSaveAddress) {
        btnSaveAddress.addEventListener('click', async () => {
            if (!currentUser) return;
            
            const fullName = inputName.value.trim();
            const address = inputAddress.value.trim();
            const city = inputCity.value.trim();
            const postal = inputPostal.value.trim();
            
            if (!fullName || !address || !city || !postal) {
                alert('Please fill out all address fields.');
                return;
            }

            const fullAddress = `${address}, ${city}, ${postal}`;
            const data = {
                name: fullName,
                email: currentUser.email,
                address: fullAddress
            };

            try {
                btnSaveAddress.textContent = 'Saving...';
                btnSaveAddress.disabled = true;

                if (customerDocId) {
                    // Update existing record
                    await databases.updateDocument(
                        DATABASE_ID,
                        CUSTOMERS_COLLECTION_ID,
                        customerDocId,
                        data
                    );
                } else {
                    // Create new record
                    const response = await databases.createDocument(
                        DATABASE_ID,
                        CUSTOMERS_COLLECTION_ID,
                        ID.unique(),
                        data
                    );
                    customerDocId = response.$id;
                }
                alert('Address saved successfully!');
                btnSaveAddress.textContent = 'Saved';
                setTimeout(() => {
                    btnSaveAddress.textContent = 'Save Address';
                    btnSaveAddress.disabled = false;
                }, 2000);
            } catch (error) {
                console.error('Error saving address:', error);
                alert('Failed to save address.');
                btnSaveAddress.textContent = 'Save Address';
                btnSaveAddress.disabled = false;
            }
        });
    }

    function showCheckoutView() {
        checkoutView.classList.remove('hidden');
        checkoutView.scrollIntoView({ behavior: 'smooth' });
    }

    async function loadCustomerAddress() {
        if (!currentUser) return;
        
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                CUSTOMERS_COLLECTION_ID,
                [Query.equal('email', currentUser.email)]
            );
            
            if (response.documents.length > 0) {
                const doc = response.documents[0];
                customerDocId = doc.$id;
                
                inputName.value = doc.name || '';
                
                if (doc.address) {
                    // Try to split full address back into parts if possible
                    const parts = doc.address.split(', ');
                    if (parts.length >= 3) {
                        inputAddress.value = parts.slice(0, -2).join(', ');
                        inputCity.value = parts[parts.length - 2];
                        inputPostal.value = parts[parts.length - 1];
                    } else {
                        inputAddress.value = doc.address;
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching customer record:', error);
        }
    }
});
