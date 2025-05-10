import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { useToast } from "./ui/use-toast";

const WrfDomainForm = ({
  onSubmit,
  defaultValues = {
    e_we: 100,
    e_sn: 100,
    dx: 30,
    dy: 30,
    ref_lat: 34.0,
    ref_lon: 118.0,
    truelat1: 30.0,
    truelat2: 60.0,
    stand_lon: 118.0,
    max_dom: 1,
    map_proj: "lambert",
  },
}) => {
  const [formValues, setFormValues] = useState(defaultValues);
  const [errors, setErrors] = useState({});
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormValues(defaultValues);
    setErrors({});
  }, [defaultValues]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let parsedValue = value;
    if (type === "number") {
      parsedValue = value === "" ? "" : parseFloat(value);
    }
    setFormValues({
      ...formValues,
      [name]: parsedValue,
    });
    if (errors[name]) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const { e_we, e_sn, dx, dy, ref_lat, ref_lon, truelat1, truelat2, stand_lon, max_dom, map_proj } = formValues;

    const validateNumber = (val, fieldName, isInt = false, min, max) => {
      if (val === "" || val === null || val === undefined) {
        newErrors[fieldName] = "此字段不能为空";
        return false;
      }
      const num = parseFloat(val);
      if (isNaN(num)) {
        newErrors[fieldName] = "请输入有效的数字";
        return false;
      }
      if (isInt && !Number.isInteger(num)) {
        newErrors[fieldName] = "请输入整数";
        return false;
      }
      if (min !== undefined && num < min) {
        newErrors[fieldName] = `值不能小于 ${min}`;
        return false;
      }
      if (max !== undefined && num > max) {
        newErrors[fieldName] = `值不能大于 ${max}`;
        return false;
      }
      return true;
    };

    validateNumber(e_we, "e_we", true, 3);
    validateNumber(e_sn, "e_sn", true, 3);
    validateNumber(dx, "dx", false, 0.01);
    validateNumber(dy, "dy", false, 0.01);
    validateNumber(ref_lat, "ref_lat", false, -90, 90);
    validateNumber(ref_lon, "ref_lon", false, -180, 180);
    validateNumber(truelat1, "truelat1", false, -90, 90);
    validateNumber(truelat2, "truelat2", false, -90, 90);
    validateNumber(stand_lon, "stand_lon", false, -180, 180);
    validateNumber(max_dom, "max_dom", true, 1, 1);

    if (!map_proj) {
      newErrors.map_proj = "请选择地图投影方式";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = () => {
    if (validateForm()) {
      setIsSubmitting(true);
      setTimeout(() => {
        if (onSubmit) {
          onSubmit(formValues);
        }
        setIsSubmitting(false);
      }, 200);
    } else {
      toast({
        title: "表单校验失败",
        description: "请检查表单中的错误提示并修正。",
        variant: "destructive",
      });
    }
  };

  const renderInputField = (name, label, type = "number", props = {}) => (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={formValues[name] === null || formValues[name] === undefined ? "" : formValues[name]}
        onChange={handleChange}
        className={errors[name] ? "border-destructive" : ""}
        {...props}
      />
      {errors[name] && <p className="text-xs text-destructive mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <Card className="w-full max-w-3xl p-6">
      <h2 className="text-2xl font-bold mb-6">WRF域配置 (手动表单)</h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderInputField("e_we", "E_WE (西-东格点数)", "number", { min: 3, step: 1 })}
          {renderInputField("e_sn", "E_SN (南-北格点数)", "number", { min: 3, step: 1 })}
          {renderInputField("dx", "DX (x方向格距, km)", "number", { min: 0.01, step: 0.01 })}
          {renderInputField("dy", "DY (y方向格距, km)", "number", { min: 0.01, step: 0.01 })}
          {renderInputField("ref_lat", "参考纬度 (°)", "number", { step: 0.000001, min: -90, max: 90 })}
          {renderInputField("ref_lon", "参考经度 (°)", "number", { step: 0.000001, min: -180, max: 180 })}
          {renderInputField("truelat1", "第一标准纬度 (°)", "number", { step: 0.000001, min: -90, max: 90 })}
          {renderInputField("truelat2", "第二标准纬度 (°)", "number", { step: 0.000001, min: -90, max: 90 })}
          {renderInputField("stand_lon", "标准经度 (°)", "number", { step: 0.000001, min: -180, max: 180 })}
          {renderInputField("max_dom", "最大域数量 (MVP=1)", "number", { min: 1, max: 1, step: 1 })}
        </div>

        <div className="space-y-1 col-span-1 md:col-span-2">
          <Label htmlFor="map_proj">地图投影方式</Label>
          <div className="relative">
            <select
              id="map_proj"
              name="map_proj"
              className={`w-full h-9 rounded-lg border ${errors.map_proj ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 appearance-none`}
              value={formValues.map_proj}
              onChange={handleChange}
            >
              <option value="">选择投影...</option> 
              <option value="lambert">Lambert Conformal</option>
              <option value="polar">Polar Stereographic</option>
              <option value="mercator">Mercator</option>
              <option value="lat-lon">Lat-Lon</option>
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </span>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button 
            type="button" 
            onClick={handleFormSubmit}
            className={`relative ${isSubmitting ? 'opacity-80 scale-95' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? '保存中...' : '保存域配置'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default WrfDomainForm; 