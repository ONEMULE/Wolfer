import React, { useState, useEffect, useId } from "react";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { InfoIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./CustomSelect";
import { DYNAMICS_OPTIONS } from "../utils/constants";

// Initializer for formValues based on defaultValues from context (array structure)
const initializeFormValues = (dv) => {
  if (!dv) return {};
  const initial = {};
  const fields = ["diff_opt", "km_opt", "non_hydrostatic"]; // Add other dynamics fields as needed
  
  fields.forEach(field => {
    const arrKey = `${field}_arr`;
    if (dv[arrKey] && dv[arrKey].length > 0) {
      initial[arrKey] = [...dv[arrKey]];
    } else {
      // Fallback logic if not present in defaultValues
      if (field === "non_hydrostatic") {
        initial[arrKey] = [true]; // Default for boolean
      } else if (DYNAMICS_OPTIONS[field] && Object.keys(DYNAMICS_OPTIONS[field]).length > 0) {
        initial[arrKey] = [parseInt(Object.keys(DYNAMICS_OPTIONS[field])[0])];
      } else {
        initial[arrKey] = [field === "diff_opt" ? 2 : 4]; // Default for diff_opt/km_opt if no constant
      }
    }
  });
  // Add any other specific dynamics options here if they don't follow the _arr pattern directly
  // For example: if there's a 'time_step_seconds_arr', etc.
  return initial;
};

const DynamicsForm = ({ 
  onSubmit,
  defaultValues // Expected: { diff_opt_arr: [X], km_opt_arr: [Y], non_hydrostatic_arr: [Z], ... }
}) => {
  const [formValues, setFormValues] = useState(() => initializeFormValues(defaultValues));
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const ids = {
    diff_opt_arr: useId(),
    km_opt_arr: useId(),
    non_hydrostatic_arr: useId(),
    // Add other ids as needed
  };

  useEffect(() => {
    setFormValues(initializeFormValues(defaultValues));
    setErrors({});
  }, [defaultValues]);

  const handleChange = (fieldName, value) => {
    let processedValue = value;
    // For boolean (non_hydrostatic_arr), value is already boolean from checkbox
    // For selects, value is string, parse to int
    if (fieldName !== "non_hydrostatic_arr") {
      processedValue = parseInt(value, 10);
    }

    setFormValues(prev => ({
      ...prev,
      [fieldName]: [processedValue] // Store as single-element array for MVP
    }));
    
    if (errors[fieldName]) {
      setErrors(prevErrors => ({ ...prevErrors, [fieldName]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formValues.diff_opt_arr || formValues.diff_opt_arr[0] === undefined) {
      newErrors.diff_opt_arr = "请选择扩散选项";
    }
    if (!formValues.km_opt_arr || formValues.km_opt_arr[0] === undefined) {
      newErrors.km_opt_arr = "请选择湍流系数选项";
    }
    // non_hydrostatic_arr is a boolean, usually doesn't need explicit validation unless it can be undefined
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      setTimeout(() => {
        if (onSubmit) {
          onSubmit(formValues); // formValues is now { diff_opt_arr: [X], ... }
        }
        setIsSubmitting(false);
      }, 200);
    }
  };
  
  if (!formValues || Object.keys(formValues).length === 0) {
      return <p>加载动力学参数表单...</p>;
  }

  return (
    <Card className="w-full max-w-4xl p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">WRF动力学配置 (Context驱动)</h2>
        <p className="text-sm text-muted-foreground mt-1">
          配置WRF模型的动力学参数
        </p>
      </div>
      
      <form onSubmit={handleFormSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Diffusion Option */}
          <div className="space-y-2">
            <Label htmlFor={ids.diff_opt_arr}>扩散选项 (diff_opt)</Label>
            <Select 
              value={formValues.diff_opt_arr && formValues.diff_opt_arr[0] !== undefined ? formValues.diff_opt_arr[0].toString() : ""}
              onValueChange={(value) => handleChange("diff_opt_arr", value)}
            >
              <SelectTrigger id={ids.diff_opt_arr} className={errors.diff_opt_arr ? "border-destructive" : ""}>
                <SelectValue placeholder="选择扩散选项" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DYNAMICS_OPTIONS.diff_opt).map(([optValue, label]) => (
                  <SelectItem key={optValue} value={optValue.toString()}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.diff_opt_arr && (
              <p className="text-xs text-destructive">{errors.diff_opt_arr}</p>
            )}
          </div>

          {/* Eddy Coefficient Option */}
          <div className="space-y-2">
            <Label htmlFor={ids.km_opt_arr}>湍流系数选项 (km_opt)</Label>
            <Select 
              value={formValues.km_opt_arr && formValues.km_opt_arr[0] !== undefined ? formValues.km_opt_arr[0].toString() : ""}
              onValueChange={(value) => handleChange("km_opt_arr", value)}
            >
              <SelectTrigger id={ids.km_opt_arr} className={errors.km_opt_arr ? "border-destructive" : ""}>
                <SelectValue placeholder="选择湍流系数选项" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DYNAMICS_OPTIONS.km_opt).map(([optValue, label]) => (
                  <SelectItem key={optValue} value={optValue.toString()}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.km_opt_arr && (
              <p className="text-xs text-destructive">{errors.km_opt_arr}</p>
            )}
          </div>

          {/* Non-hydrostatic Option - 跨越两列 */}
          <div className="col-span-1 md:col-span-2 flex items-center space-x-2 mt-4">
            <input
              type="checkbox"
              id={ids.non_hydrostatic_arr} // Use ids object
              checked={formValues.non_hydrostatic_arr ? !!formValues.non_hydrostatic_arr[0] : false}
              onChange={(e) => handleChange("non_hydrostatic_arr", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
            <Label htmlFor={ids.non_hydrostatic_arr} className="cursor-pointer">
              使用非静力学模式 (Non-hydrostatic)
            </Label>
          </div>
        </div>
        
        <Alert className="mt-6 mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-start">
            <InfoIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
            <AlertDescription className="text-blue-700">
              <AlertTitle className="text-blue-700 mb-1">动力学配置说明</AlertTitle>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>扩散选项控制模型的数值扩散和稳定性</li>
                <li>湍流系数选项影响湍流混合过程的处理方式</li>
                <li>非静力学模式对于分辨率小于10km的模拟非常重要</li>
              </ul>
            </AlertDescription>
          </div>
        </Alert>

        <div className="flex justify-end mt-6">
          <Button 
            type="submit" 
            className={`relative ${isSubmitting ? 'opacity-80 scale-95' : ''}`}
            disabled={isSubmitting || Object.keys(errors).some(key => errors[key] !== null)}
          >
            {isSubmitting ? '保存中...' : '保存动力学配置'} 
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default DynamicsForm; 