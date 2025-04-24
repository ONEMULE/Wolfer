import React, { useState } from "react";
import { useId } from "react";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./CustomSelect";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { InfoIcon } from "lucide-react";
import { DATA_SOURCES } from "../utils/constants";

const TimeForm = ({ onSubmit, defaultValues = {
  start_date: "2024-06-01_00:00:00",
  end_date: "2024-06-02_00:00:00",
  data_source: "ERA5"
} }) => {
  const [formValues, setFormValues] = useState(defaultValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const startDateId = useId();
  const endDateId = useId();
  const dataSourceId = useId();

  const handleChange = (name, value) => {
    setFormValues({
      ...formValues,
      [name]: value
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const datePattern = /^\d{4}-\d{2}-\d{2}_\d{2}:\d{2}:\d{2}$/;
    
    if (!datePattern.test(formValues.start_date)) {
      newErrors.start_date = "请使用正确的格式：YYYY-MM-DD_HH:MM:SS";
    }
    
    if (!datePattern.test(formValues.end_date)) {
      newErrors.end_date = "请使用正确的格式：YYYY-MM-DD_HH:MM:SS";
    }
    
    // Check if end date is after start date
    if (Object.keys(newErrors).length === 0) {
      const startDate = new Date(formValues.start_date.replace("_", "T"));
      const endDate = new Date(formValues.end_date.replace("_", "T"));
      
      if (endDate <= startDate) {
        newErrors.end_date = "结束日期必须晚于开始日期";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // 添加延迟以显示动画效果
      setTimeout(() => {
        if (onSubmit) {
          onSubmit(formValues);
        }
        // Save to localStorage
        localStorage.setItem("timeConfig", JSON.stringify(formValues));
        setIsSubmitting(false);
      }, 200);
    }
  };

  return (
    <Card className="w-full max-w-4xl p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">模拟时间设置</h2>
        <p className="text-sm text-muted-foreground mt-1">
          定义WRF模拟的时间范围和初始数据来源
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor={startDateId} className="flex items-center gap-2">
                开始时间
                <span className="text-xs text-muted-foreground">(YYYY-MM-DD_HH:MM:SS)</span>
              </Label>
              <Input
                id={startDateId}
                placeholder="2024-06-01_00:00:00"
                value={formValues.start_date}
                onChange={(e) => handleChange("start_date", e.target.value)}
                className={errors.start_date ? "border-destructive" : ""}
              />
              {errors.start_date && (
                <p className="text-xs text-destructive">{errors.start_date}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={endDateId} className="flex items-center gap-2">
                结束时间
                <span className="text-xs text-muted-foreground">(YYYY-MM-DD_HH:MM:SS)</span>
              </Label>
              <Input
                id={endDateId}
                placeholder="2024-06-02_00:00:00"
                value={formValues.end_date}
                onChange={(e) => handleChange("end_date", e.target.value)}
                className={errors.end_date ? "border-destructive" : ""}
              />
              {errors.end_date && (
                <p className="text-xs text-destructive">{errors.end_date}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={dataSourceId}>数据源</Label>
            <Select
              defaultValue={formValues.data_source}
              onValueChange={(value) => handleChange("data_source", value)}
            >
              <SelectTrigger id={dataSourceId}>
                <SelectValue placeholder="选择气象数据源" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DATA_SOURCES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">选择用于初始和边界条件的气象数据源</p>
          </div>
          
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>资源影响</AlertTitle>
            <AlertDescription>
              模拟时间跨度直接影响计算资源需求和预报准确性。在设置时间范围时，请考虑以下因素：
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>更长的时间跨度需要更多的计算时间</li>
                <li>预报准确性通常随着时间跨度的增加而降低</li>
                <li>历史数据的可用性可能限制开始日期</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              className={`relative ${isSubmitting ? 'opacity-80 scale-95' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? '保存中...' : '保存时间设置'}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default TimeForm; 