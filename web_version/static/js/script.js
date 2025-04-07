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
    
    // 获取嵌套对象中的值
    function getNestedValue(obj, path) {
        const keys = path.split('.');
        let result = obj;
        
        for (const key of keys) {
            if (result && typeof result === 'object' && key in result) {
                result = result[key];
            } else {
                return '';
            }
        }
        
        return result;
    }
    
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
    if (dataSourceSelect) {
        dataSourceSelect.addEventListener('change', function() {
            if (era5Settings) {
                if (this.value === 'ERA5') {
                    era5Settings.style.display = 'block';
                } else {
                    era5Settings.style.display = 'none';
                }
            }
        });
        
        // Trigger the change event to set initial state
        dataSourceSelect.dispatchEvent(new Event('change'));
    }
    
    // Save form data
    function saveFormData() {
        // Basic fields
        formData.start_date = document.getElementById('start_date').value;
        formData.end_date = document.getElementById('end_date').value;
        formData.data_source = document.getElementById('data_source').value;
        formData.projection = parseInt(document.getElementById('projection').value);
        formData.output_dir = document.getElementById('output_dir') ? document.getElementById('output_dir').value : '';
        
        // Domain fields
        const domainFields = [
            'e_we', 'e_sn', 'dx', 'dy', 'ref_lat', 'ref_lon', 
            'truelat1', 'truelat2', 'stand_lon', 'max_dom'
        ];
        
        domainFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                // Convert to number for numeric fields
                if (field === 'max_dom') {
                    formData.domain[field] = parseInt(element.value);
                } else if (['e_we', 'e_sn'].includes(field)) {
                    formData.domain[field] = parseInt(element.value);
                } else {
                    formData.domain[field] = parseFloat(element.value);
                }
            }
        });
        
        // Set array fields based on max_dom value
        const maxDom = formData.domain.max_dom || 1;
        
        // Parent grid ratio (default: [1, 3, 3])
        formData.domain.parent_grid_ratio = [1];
        for (let i = 1; i < maxDom; i++) {
            formData.domain.parent_grid_ratio.push(3);
        }
        
        // Parent time step ratio (default: [1, 3, 3])
        formData.domain.parent_time_step_ratio = [1];
        for (let i = 1; i < maxDom; i++) {
            formData.domain.parent_time_step_ratio.push(3);
        }
        
        // i_parent_start (default: [1, 31, 31])
        formData.domain.i_parent_start = [1];
        for (let i = 1; i < maxDom; i++) {
            formData.domain.i_parent_start.push(31);
        }
        
        // j_parent_start (default: [1, 17, 33])
        formData.domain.j_parent_start = [1];
        for (let i = 1; i < maxDom; i++) {
            formData.domain.j_parent_start.push(17 + i * 16);
        }
        
        // Physics fields
        const physicsFields = [
            'mp_physics', 'ra_lw_physics', 'ra_sw_physics',
            'sf_surface_physics', 'bl_pbl_physics', 'cu_physics'
        ];
        
        physicsFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                formData.physics[field] = parseInt(element.value);
            }
        });
        
        // Dynamics fields
        const dynamicsFields = ['diff_opt', 'km_opt'];
        
        dynamicsFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                formData.dynamics[field] = parseInt(element.value);
            }
        });
        
        // Add non_hydrostatic field (default: true)
        formData.dynamics.non_hydrostatic = true;
        
        // User settings
        const userSettingsFields = [
            'geog_data_path', 'cds_api_key', 'cds_api_url',
            'wps_path', 'wrf_path'
        ];
        
        userSettingsFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                formData.user_settings[field] = element.value;
            }
        });
        
        return formData;
    }
    
    // Generate button click handler
    if (generateBtn) {
        generateBtn.addEventListener('click', function() {
            // 检查最后一个步骤是否有错误
            if (!validateStep(5)) {
                showNotification('请在提交前确保所有必填字段正确填写。', 'error');
                return;
            }
            
            // 获取完整表单数据
            saveFormData();
            
            // 显示加载动画
            const loadingOverlay = document.createElement('div');
            loadingOverlay.className = 'loading-overlay';
            loadingOverlay.innerHTML = `
                <div class="loading-spinner"></div>
                <div class="loading-message">正在生成文件，请稍候...</div>
            `;
            document.body.appendChild(loadingOverlay);
            
            // 清空之前的结果消息
            if (resultMessages) {
                resultMessages.innerHTML = '';
            }
            
            // 发送AJAX请求
            fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                // 移除加载动画
                document.body.removeChild(loadingOverlay);
                
                if (data.success) {
                    // 显示结果部分
                    if (resultSection) {
                        resultSection.style.display = 'block';
                        
                        // 滚动到结果部分
                        resultSection.scrollIntoView({ behavior: 'smooth' });
                    }
                    
                    // 显示输出目录
                    if (outputDirPath) {
                        outputDirPath.textContent = data.output_dir;
                    }
                    
                    // 显示消息列表
                    if (resultMessages) {
                        let messageList = '';
                        data.messages.forEach(message => {
                            let messageClass = 'info';
                            if (message.includes('Error') || message.includes('错误')) {
                                messageClass = 'error';
                            } else if (message.includes('complete') || message.includes('完成')) {
                                messageClass = 'success';
                            }
                            messageList += `<div class="message ${messageClass}">${message}</div>`;
                        });
                        resultMessages.innerHTML = messageList;
                    }
                    
                    // 设置下载链接
                    if (data.download_links) {
                        const downloadWps = document.getElementById('download-wps');
                        const downloadInput = document.getElementById('download-input');
                        const downloadScript = document.getElementById('download-script');
                        const downloadRun = document.getElementById('download-run');
                        
                        if (downloadWps) downloadWps.href = data.download_links['namelist.wps'];
                        if (downloadInput) downloadInput.href = data.download_links['namelist.input'];
                        if (downloadScript) downloadScript.href = data.download_links['download_script'];
                        if (downloadRun) downloadRun.href = data.download_links['run_script'];
                        
                        // 加载预览内容
                        loadNamelistPreview(data.download_links['namelist.wps'], data.download_links['namelist.input']);
                    }
                    
                    showNotification('文件生成成功！', 'success');
                } else {
                    showNotification(`生成失败: ${data.error}`, 'error');
                }
            })
            .catch(error => {
                // 移除加载动画
                if (document.body.contains(loadingOverlay)) {
                    document.body.removeChild(loadingOverlay);
                }
                
                console.error('Error:', error);
                showNotification('请求失败，请检查网络连接。', 'error');
            });
        });
    }
    
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
    
    // 加载namelist文件预览内容
    function loadNamelistPreview(wpsUrl, inputUrl) {
        const wpsContent = document.getElementById('wps-content');
        const inputContent = document.getElementById('input-content');
        
        // 加载namelist.wps预览
        if (wpsContent) {
            fetch(wpsUrl)
                .then(response => response.text())
                .then(content => {
                    wpsContent.textContent = content;
                })
                .catch(error => {
                    console.error('Error loading WPS preview:', error);
                    wpsContent.textContent = 'Failed to load preview';
                });
        }
        
        // 加载namelist.input预览
        if (inputContent) {
            fetch(inputUrl)
                .then(response => response.text())
                .then(content => {
                    inputContent.textContent = content;
                })
                .catch(error => {
                    console.error('Error loading INPUT preview:', error);
                    inputContent.textContent = 'Failed to load preview';
                });
        }
    }
    
    // 为预览标签页添加切换功能
    const tabs = document.querySelectorAll('.tab');
    if (tabs.length > 0) {
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // 移除所有标签的active类
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                // 为当前点击的标签添加active类
                this.classList.add('active');
                
                // 获取目标标签内容ID
                const targetId = this.getAttribute('data-tab') + '-tab';
                const targetElement = document.getElementById(targetId);
                
                // 隐藏所有内容
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                // 显示目标内容
                if (targetElement) {
                    targetElement.classList.add('active');
                }
            });
        });
    }
});