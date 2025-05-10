import React, { useState, useEffect } from "react";
import { useId } from "react";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./CustomSelect";
import { PHYSICS_OPTIONS } from "../utils/constants";

// Helper to get the first element of an array or a fallback string
const getFirstArrVal = (arr, fallback = "") => {
  return arr && arr.length > 0 ? arr[0].toString() : fallback;
};

const PhysicsForm = ({ onSubmit, defaultValues }) => {
  // Initialize formValues based on the array structure expected by ConfigContext
  const initializeFormValues = (dv) => {
    if (!dv) return {}; // Should not happen if ConfigContext is working
    const initial = {};
    for (const key in PHYSICS_OPTIONS) {
      const arrKey = `${key}_arr`; // e.g., mp_physics_arr
      // Use value from defaultValues if available, otherwise find default from PHYSICS_OPTIONS
      if (dv[arrKey] && dv[arrKey].length > 0) {
        initial[arrKey] = [...dv[arrKey]];
      } else {
        // Fallback to the first option in PHYSICS_OPTIONS for this category
        const optionsForCategory = PHYSICS_OPTIONS[key];
        if (optionsForCategory && Object.keys(optionsForCategory).length > 0) {
          initial[arrKey] = [parseInt(Object.keys(optionsForCategory)[0])]; 
        } else {
          initial[arrKey] = [1]; // Absolute fallback if no options defined
        }
      }
    }
    return initial;
  };

  const [formValues, setFormValues] = useState(() => initializeFormValues(defaultValues));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // IDs for form elements
  const ids = {
    mp_physics_arr: useId(),
    ra_lw_physics_arr: useId(),
    ra_sw_physics_arr: useId(),
    sf_surface_physics_arr: useId(),
    bl_pbl_physics_arr: useId(),
    cu_physics_arr: useId(),
  };

  useEffect(() => {
    setFormValues(initializeFormValues(defaultValues));
  }, [defaultValues]);

  const handleChange = (fieldName, value) => { // fieldName will be like 'mp_physics_arr'
    setFormValues((prevValues) => ({
      ...prevValues,
      [fieldName]: [parseInt(value)], // Update the first element of the array
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      if (onSubmit) {
        onSubmit(formValues); // formValues is now { mp_physics_arr: [X], ... }
      }
      setIsSubmitting(false);
    }, 200);
  };

  // Helper to render select fields
  const renderSelectField = (fieldName, label, options) => {
    // fieldName is like 'mp_physics_arr'
    // We need to access formValues[fieldName][0] for the value
    const currentValue = formValues[fieldName] && formValues[fieldName][0] !== undefined 
                         ? formValues[fieldName][0].toString() 
                         : "";
    return (
      <div className="space-y-2">
        <Label htmlFor={ids[fieldName]}>{label}</Label>
        <Select 
          value={currentValue}
          onValueChange={(value) => handleChange(fieldName, value)}
        >
          <SelectTrigger id={ids[fieldName]} className="[&_[data-desc]]:hidden">
            <SelectValue placeholder={`选择${label}`} />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(options).map(([val, desc]) => (
              <SelectItem key={val} value={val.toString()}>
                {desc} 
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };
  
  if (!formValues || Object.keys(formValues).length === 0) {
      return <p>加载物理参数表单...</p>; // Or some other loading indicator
  }

  return (
    <Card className="w-full max-w-4xl p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">WRF物理参数设置 (Context驱动)</h2>
        <p className="text-sm text-muted-foreground mt-1">
          选择适合您模拟需求的物理参数化方案
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderSelectField("mp_physics_arr", "微物理方案 (mp_physics)", PHYSICS_OPTIONS.mp_physics)}
          {renderSelectField("ra_lw_physics_arr", "长波辐射 (ra_lw_physics)", PHYSICS_OPTIONS.ra_lw_physics)}
          {renderSelectField("ra_sw_physics_arr", "短波辐射 (ra_sw_physics)", PHYSICS_OPTIONS.ra_sw_physics)}
          {renderSelectField("sf_surface_physics_arr", "地表物理 (sf_surface_physics)", PHYSICS_OPTIONS.sf_surface_physics)}
          {renderSelectField("bl_pbl_physics_arr", "边界层方案 (bl_pbl_physics)", PHYSICS_OPTIONS.bl_pbl_physics)}
          {renderSelectField("cu_physics_arr", "积云方案 (cu_physics)", PHYSICS_OPTIONS.cu_physics)}
        </div>

        <div className="flex justify-end mt-6">
          <Button 
            type="submit" 
            className={`relative ${isSubmitting ? 'opacity-80 scale-95' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? '保存中...' : '保存物理参数设置'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default PhysicsForm; 