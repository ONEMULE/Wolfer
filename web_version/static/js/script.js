document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const stepItems = document.querySelectorAll('.step-item');
    const stepPages = document.querySelectorAll('.step-page');
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');
    const generateBtn = document.getElementById('generate-btn');
    const resultSection = document.getElementById('result-section');
    const resultMessages = document.getElementById('result-messages');
    const outputDirPath = document.getElementById('output-dir-path');
    const dataSourceSelect = document.getElementById('data_source');
    const era5Settings = document.getElementById('era5-settings');
    
    // Initialize form data object
    let formData = {
        domain: {},
        physics: {},
        user_settings: {}
    };
    
    // Handle step navigation
    function goToStep(stepNumber) {
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
        
        // Update step pages
        stepPages.forEach(page => {
            page.classList.remove('active');
            if (page.id === `step-${stepNumber}`) {
                page.classList.add('active');
                
                // Add animation
                page.classList.add('fade-in');
                setTimeout(() => {
                    page.classList.remove('fade-in');
                }, 500);
            }
        });
        
        // Save form data on step change
        saveFormData();
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
            goToStep(stepNumber);
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
        // Show loading state
        this.disabled = true;
        this.innerHTML = '<div class="spinner"></div>';
        
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
            generateBtn.innerHTML = 'Generate WRF Files';
            
            // Show results
            resultSection.style.display = 'block';
            resultSection.scrollIntoView({ behavior: 'smooth' });
            
            outputDirPath.textContent = data.output_dir;
            
            // Display messages
            resultMessages.innerHTML = '';
            data.messages.forEach(message => {
                const msgElem = document.createElement('div');
                msgElem.textContent = message;
                resultMessages.appendChild(msgElem);
            });
            
            // Update download links
            const downloadLinks = document.querySelectorAll('.download-link');
            downloadLinks.forEach(link => {
                const fileName = link.getAttribute('data-file');
                link.href = `/download/${fileName}?output_dir=${encodeURIComponent(data.output_dir)}`;
            });
        })
        .catch(error => {
            console.error('Error:', error);
            
            // Reset button state
            generateBtn.disabled = false;
            generateBtn.innerHTML = 'Generate WRF Files';
            
            // Show error message
            alert('An error occurred while generating files. Please check the console for details.');
        });
    });
    
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
});