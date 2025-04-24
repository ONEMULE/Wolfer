import React, { useState, useId } from "react";
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

const DynamicsForm = ({ 
  onSubmit,
  defaultValues = {
    diff_opt: 2,
    km_opt: 4,
    non_hydrostatic: true,
  }
}) => {
  const [formValues, setFormValues] = useState(defaultValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 生成唯一ID
  const diffOptId = useId();
  const kmOptId = useId();
  const nonHydrostaticId = useId();

  const handleChange = (name, value) => {
    setFormValues(prev => ({
      ...prev,
      [name]: typeof value === 'string' && !isNaN(parseInt(value, 10)) 
        ? parseInt(value, 10) 
        : value
    }));
    
    // 清除该字段的错误
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // 验证diff_opt
    if (formValues.diff_opt === undefined || formValues.diff_opt === null) {
      newErrors.diff_opt = "请选择扩散选项";
    }
    
    // 验证km_opt
    if (formValues.km_opt === undefined || formValues.km_opt === null) {
      newErrors.km_opt = "请选择湍流系数选项";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // 添加延迟以显示动画效果
      setTimeout(() => {
        if (onSubmit) {
          onSubmit(formValues);
        }
        setIsSubmitting(false);
      }, 200);
    }
  };

  return (
    <Card className="w-full max-w-4xl p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">WRF动力学配置</h2>
        <p className="text-sm text-muted-foreground mt-1">
          配置WRF模型的动力学参数
        </p>
      </div>
      
      <form onSubmit={handleFormSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Diffusion Option */}
          <div className="space-y-2">
            <Label htmlFor={diffOptId}>扩散选项 (diff_opt)</Label>
            <Select 
              defaultValue={formValues.diff_opt.toString()} 
              onValueChange={(value) => handleChange("diff_opt", value)}
            >
              <SelectTrigger id={diffOptId} className={errors.diff_opt ? "border-destructive" : ""}>
                <SelectValue placeholder="选择扩散选项" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DYNAMICS_OPTIONS.diff_opt).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.diff_opt && (
              <p className="text-xs text-destructive">{errors.diff_opt}</p>
            )}
          </div>

          {/* Eddy Coefficient Option */}
          <div className="space-y-2">
            <Label htmlFor={kmOptId}>湍流系数选项 (km_opt)</Label>
            <Select 
              defaultValue={formValues.km_opt.toString()} 
              onValueChange={(value) => handleChange("km_opt", value)}
            >
              <SelectTrigger id={kmOptId} className={errors.km_opt ? "border-destructive" : ""}>
                <SelectValue placeholder="选择湍流系数选项" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DYNAMICS_OPTIONS.km_opt).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.km_opt && (
              <p className="text-xs text-destructive">{errors.km_opt}</p>
            )}
          </div>

          {/* Non-hydrostatic Option - 跨越两列 */}
          <div className="col-span-1 md:col-span-2 flex items-center space-x-2">
            <input
              type="checkbox"
              id={nonHydrostaticId}
              checked={formValues.non_hydrostatic}
              onChange={() => handleChange("non_hydrostatic", !formValues.non_hydrostatic)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor={nonHydrostaticId} className="cursor-pointer">
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
            disabled={isSubmitting}
          >
            {isSubmitting ? '保存中...' : '保存配置'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default DynamicsForm; 