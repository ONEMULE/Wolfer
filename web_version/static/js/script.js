document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const stepItems = document.querySelectorAll('.step-item');
    const stepPages = document.querySelectorAll('.step-page');
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');
    const generateBtn = document.getElementById('generate-btn');
    const resultSection = document.getElementById('result-section');
    const resultMessages = document.getElementById('result-messages');
    const configSummary = document.getElementById('config-summary');
    const outputDirPath = document.getElementById('output-dir-path');
    const dataSourceSelect = document.getElementById('data_source');
    const era5Settings = document.getElementById('era5-settings');
    
    // Initialize form data object
    let formData = {
        domain: {},
        physics: {},
        dynamics: {},
        user_settings: {}
    };
    
    // Form validation patterns
    const validationPatterns = {
        date: /^\d{4}-\d{2}-\d{2}_\d{2}:\d{2}:\d{2}$/,
        number: /^-?\d*\.?\d+$/
    };
    
    // Initialize form validation
    function initializeFormValidation() {
        const inputs = document.querySelectorAll('input[pattern]');
        inputs.forEach(input => {
            // Add validation message element
            const validationMessage = document.createElement('div');
            validationMessage.className = 'validation-message';
            validationMessage.textContent = `Please match the required format: ${input.placeholder}`;
            input.parentNode.appendChild(validationMessage);
            
            // Add input event listener
            input.addEventListener('input', function() {
                validateInput(this);
            });
        });
    }
    
    // Validate single input
    function validateInput(input) {
        const pattern = input.getAttribute('pattern');
        if (pattern) {
            const regex = new RegExp(pattern);
            const isValid = regex.test(input.value);
            input.classList.toggle('invalid', !isValid);
            return isValid;
        }
        return true;
    }
    
    // Validate step
    function validateStep(stepNumber) {
        const stepPage = document.getElementById(`step-${stepNumber}`);
        const inputs = stepPage.querySelectorAll('input[pattern], select[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
                input.classList.add('invalid');
            }
        });
        
        return isValid;
    }
    
    // Handle step navigation
    function goToStep(stepNumber) {
        // Validate current step before proceeding
        const currentStep = document.querySelector('.step-page.active');
        const currentStepNumber = parseInt(currentStep.id.split('-')[1]);
        
        if (stepNumber > currentStepNumber && !validateStep(currentStepNumber)) {
            showNotification('Please fill in all required fields correctly before proceeding.', 'error');
            return;
        }
        
        // Update step indicators
        stepItems.forEach(item => {
            const itemStep = parseInt(item.getAttribute('data-step'));
            item.classList.remove('active', 'completed');
            
            if (itemStep === stepNumber) {
                item.classList.add('active');
            } else if (itemStep < stepNumber) {
                item.classList.add('completed');
            }
        });
        
        // Update step pages with slide animation
        const currentPage = document.querySelector('.step-page.active');
        const nextPage = document.getElementById(`step-${stepNumber}`);
        const isForward = stepNumber > currentStepNumber;
        
        currentPage.style.transform = isForward ? 'translateX(-20px)' : 'translateX(20px)';
        currentPage.style.opacity = '0';
        
        setTimeout(() => {
            currentPage.classList.remove('active');
            nextPage.classList.add('active');
            nextPage.style.transform = isForward ? 'translateX(20px)' : 'translateX(-20px)';
            nextPage.style.opacity = '0';
            
            // Trigger reflow
            nextPage.offsetHeight;
            
            nextPage.style.transform = 'translateX(0)';
            nextPage.style.opacity = '1';
        }, 300);
        
        // Save form data on step change
        saveFormData();
        
        // Update config summary if on review step
        if (stepNumber === 5) {
            updateConfigSummary();
        }
    }
    
    // Show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 3000);
        }, 3000);
    }
    
    // Update configuration summary
    function updateConfigSummary() {
        saveFormData();
        
        const sections = {
            'Time Settings': {
                icon: 'clock',
                fields: ['start_date', 'end_date']
            },
            'Domain Configuration': {
                icon: 'globe',
                fields: ['domain.max_dom', 'domain.dx', 'domain.dy', 'domain.e_we', 'domain.e_sn']
            },
            'Physics Options': {
                icon: 'atom',
                fields: ['physics.mp_physics', 'physics.cu_physics', 'physics.ra_lw_physics', 'physics.ra_sw_physics']
            },
            'Dynamics Settings': {
                icon: 'wind',
                fields: ['dynamics.diff_opt', 'dynamics.km_opt']
            }
        };
        
        let html = '';
        
        for (const [section, config] of Object.entries(sections)) {
            html += `
                <div class="config-section">
                    <h3><i class="fas fa-${config.icon}"></i> ${section}</h3>
                    <div class="config-items">
            `;
            
            for (const field of config.fields) {
                const value = getNestedValue(formData, field);
                const label = field.split('.').pop().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                
                html += `
                    <div class="config-item">
                        <span class="config-label">${label}</span>
                        <span class="config-value">${value}</span>
                    </div>
                `;
            }
            
            html += `
                    </div>
                </div>
            `;
        }
        
        configSummary.innerHTML = html;
    }
    
    // Get nested object value by path
    function getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => 
            current && current[key] !== undefined ? current[key] : 'Not set', obj);
    }
    
    // Next button click handler
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const nextStep = parseInt(this.getAttribute('data-next'));
            goToStep(nextStep);
        });
    });
    
    // Previous button click handler
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            const prevStep = parseInt(this.getAttribute('data-prev'));
            goToStep(prevStep);
        });
    });
    
    // Step indicator click handler
    stepItems.forEach(item => {
        item.addEventListener('click', function() {
            const stepNumber = parseInt(this.getAttribute('data-step'));
            const currentStep = parseInt(document.querySelector('.step-item.active').getAttribute('data-step'));
            
            // Only allow clicking on completed steps or the next step
            if (stepNumber < currentStep || stepNumber === currentStep + 1) {
                goToStep(stepNumber);
            }
        });
    });
    
    // Show/hide ERA5 settings based on data source selection
    dataSourceSelect.addEventListener('change', function() {
        if (this.value === 'ERA5') {
            era5Settings.style.display = 'block';
        } else {
            era5Settings.style.display = 'none';
        }
    });
    
    // Trigger the change event to set initial state
    dataSourceSelect.dispatchEvent(new Event('change'));
    
    // Save form data
    function saveFormData() {
        const inputs = document.querySelectorAll('input, select');
        
        inputs.forEach(input => {
            if (input.name) {
                const nameParts = input.name.split('.');
                const value = parseFormValue(input.value, input.type);
                
                if (nameParts.length === 1) {
                    // Simple property
                    formData[nameParts[0]] = value;
                } else {
                    // Nested property
                    let current = formData;
                    for (let i = 0; i < nameParts.length - 1; i++) {
                        if (!current[nameParts[i]]) {
                            current[nameParts[i]] = {};
                        }
                        current = current[nameParts[i]];
                    }
                    current[nameParts[nameParts.length - 1]] = value;
                }
            }
        });
    }
    
    // Generate button click handler
    generateBtn.addEventListener('click', function() {
        // Validate all steps before generating
        for (let i = 1; i <= 4; i++) {
            if (!validateStep(i)) {
                showNotification('Please check all steps for validation errors.', 'error');
                return;
            }
        }
        
        // Show loading state
        this.disabled = true;
        const originalText = this.innerHTML;
        this.innerHTML = '<div class="spinner"></div> Generating...';
        
        // Save form data
        saveFormData();
        
        // Add missing nested arrays for domain settings if not already set
        if (!formData.domain.parent_grid_ratio) {
            formData.domain.parent_grid_ratio = [1, 3, 3];
        }
        if (!formData.domain.i_parent_start) {
            formData.domain.i_parent_start = [1, 31, 31];
        }
        if (!formData.domain.j_parent_start) {
            formData.domain.j_parent_start = [1, 17, 33];
        }
        if (!formData.domain.parent_time_step_ratio) {
            formData.domain.parent_time_step_ratio = [1, 3, 3];
        }
        
        // Send the data to the server
        fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Server error');
            }
            return response.json();
        })
        .then(data => {
            // Reset button state
            generateBtn.disabled = false;
            generateBtn.innerHTML = originalText;
            
            // Show success notification
            showNotification('Files generated successfully!', 'success');
            
            // Show results
            resultSection.style.display = 'block';
            resultSection.scrollIntoView({ behavior: 'smooth' });
            
            outputDirPath.textContent = data.output_dir;
            
            // Display messages
            resultMessages.innerHTML = '';
            data.files.forEach(file => {
                const fileItem = document.createElement('li');
                fileItem.className = 'file-item';
                fileItem.innerHTML = `
                    <i class="fas fa-file-code"></i>
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${formatFileSize(file.size)}</span>
                    <a href="/download/${file.name}" class="download-link">
                        <i class="fas fa-download"></i>
                        Download
                    </a>
                `;
                resultMessages.appendChild(fileItem);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            
            // Reset button state
            generateBtn.disabled = false;
            generateBtn.innerHTML = originalText;
            
            // Show error notification
            showNotification('An error occurred while generating files.', 'error');
        });
    });
    
    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    // Helper function to parse form values based on input type
    function parseFormValue(value, type) {
        if (type === 'number') {
            return parseFloat(value);
        } else if (value === 'true') {
            return true;
        } else if (value === 'false') {
            return false;
        } else {
            return value;
        }
    }
    
    // Initialize download links
    const downloadLinks = document.querySelectorAll('.download-link');
    downloadLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (resultSection.style.display === 'none') {
                e.preventDefault();
                alert('Please generate the files first.');
            }
        });
    });
    
    // Initialize form validation
    initializeFormValidation();
});