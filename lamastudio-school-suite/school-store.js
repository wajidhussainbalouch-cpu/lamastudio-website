<script>
        // Foolproof SchoolStore module allowing custom or auto IDs without overwriting
        const SchoolStore = {
            storageKey: 'lamastudio_schools_db',
            getAll() {
                const data = localStorage.getItem(this.storageKey);
                return data ? JSON.parse(data) : [];
            },
            saveAll(schools) {
                localStorage.setItem(this.storageKey, JSON.stringify(schools));
            },
            upsert(schoolData, customIdInput) {
                const schools = this.getAll();
                
                // Use user-provided custom ID if given, otherwise generate a unique one
                const finalId = customIdInput && customIdInput.trim() !== '' 
                    ? customIdInput.trim() 
                    : 'SCH-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
                
                schoolData.id = finalId;
                
                // Check if this ID already exists to prevent duplication collisions, otherwise push new
                const existingIndex = schools.findIndex(s => s.id === finalId);
                if (existingIndex >= 0) {
                    schools[existingIndex] = { ...schools[existingIndex], ...schoolData };
                } else {
                    schools.push(schoolData);
                }
                
                this.saveAll(schools);
                return schoolData;
            }
        };

        // Automatic Lat/Lng extraction from map links or coords
        function openMapPinHelper() {
            window.open('https://maps.google.com', '_blank');
            const pin = prompt('Paste your Google Maps location pin link or coordinates here:');
            if (pin) {
                let finalValue = pin.trim();
                const coordRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
                const match = pin.match(coordRegex);
                
                if (match) {
                    finalValue = `${pin.trim()} [Lat: ${match[1]}, Lng: ${match[2]}]`;
                } else {
                    const simpleCoords = pin.match(/^(-?\d+\.\d+),\s*(-?\d+\.\d+)$/);
                    if (simpleCoords) {
                        finalValue = `Lat: ${simpleCoords[1]}, Lng: ${simpleCoords[2]}`;
                    }
                }
                document.getElementById('mapLocation').value = finalValue;
            }
        }

        // Helper to compress/resize uploaded images target 15KB - 30KB
        function compressImage(file, callback) {
            if (!file) {
                callback(null);
                return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function(event) {
                const img = new Image();
                img.src = event.target.result;
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const maxDim = 300; 
                    if (width > height) {
                        if (width > maxDim) { height *= maxDim / width; width = maxDim; }
                    } else {
                        if (height > maxDim) { width *= maxDim / height; height = maxDim; }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    let quality = 0.5;
                    let dataUrl = canvas.toDataURL('image/jpeg', quality);
                    callback(dataUrl);
                };
            };
        }

        function handleStep1(event) {
            event.preventDefault();
            const username = document.getElementById('adminUsername').value.trim();
            const password = document.getElementById('adminPassword').value;

            if (username.length < 3) {
                alert('Admin username must be at least 3 characters long.');
                return;
            }

            const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
            if (!passRegex.test(password)) {
                alert('Password must be at least 6 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.');
                return;
            }

            localStorage.setItem('temp_admin_username', username);
            localStorage.setItem('temp_admin_password', password);

            document.getElementById('step1Form').classList.add('hidden');
            document.getElementById('step2Form').classList.remove('hidden');
            document.getElementById('stepIndicator').textContent = 'Step 2 of 2: Comprehensive Institution Profile';
        }

        function handleStep2(event) {
            event.preventDefault();
            
            const schoolName = document.getElementById('schoolName').value.trim();
            const address = document.getElementById('schoolAddress').value.trim();
            const district = document.getElementById('schoolDistrict').value.trim();
            const mapLocation = document.getElementById('mapLocation').value.trim();
            const level = document.getElementById('schoolLevel').value;
            const gender = document.getElementById('schoolGender').value;
            const customIdInput = document.getElementById('customSchoolId').value; // Get custom input value
            const idPattern = document.getElementById('idPattern').value.trim() || 'SCH-2026-###';
            const strength = document.getElementById('totalStrength').value;
            const staff = document.getElementById('totalStaff').value;
            const principal = document.getElementById('principalName').value.trim();
            const phone = document.getElementById('principalPhone').value.trim();
            const email = document.getElementById('adminEmail').value.trim();
            const tier = document.getElementById('selectedPackage').value;

            const logoFile = document.getElementById('schoolLogo').files[0];
            const receiptFile = document.getElementById('receiptPic').files[0];

            compressImage(logoFile, function(logoBase64) {
                compressImage(receiptFile, function(receiptBase64) {
                    
                    // Pass the custom ID input to upsert method
                    const newSchool = SchoolStore.upsert({
                        name: schoolName,
                        address: address,
                        district: district,
                        mapLocation: mapLocation,
                        level: level,
                        gender: gender,
                        idPattern: idPattern,
                        enrollment: strength,
                        totalStaff: staff,
                        principal: principal,
                        phone: phone,
                        email: email,
                        package: tier,
                        logo: logoBase64 || '',
                        receiptPic: receiptBase64 || '',
                        adminUsername: localStorage.getItem('temp_admin_username'),
                        verificationStatus: 'Verified', 
                        registeredAt: new Date().toISOString()
                    }, customIdInput);

                    localStorage.setItem('lamastudio_logged_in', 'true');
                    localStorage.setItem('active_tenant_id', newSchool.id);

                    alert(`Success! School ID "${newSchool.id}" has been registered.\nRedirecting to your Admin Command Center...`);

                    window.location.href = 'portals/admin/index.html';
                });
            });
        }
    </script>
