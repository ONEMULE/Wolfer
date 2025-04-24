import React, { useState } from "react";
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

const PhysicsForm = ({ onSubmit, defaultValues = {
  mp_physics: 6,
  ra_lw_physics: 1,
  ra_sw_physics: 1,
  sf_surface_physics: 2,
  bl_pbl_physics: 1,
  cu_physics: 1
} }) => {
  const [formValues, setFormValues] = useState(defaultValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mpPhysicsId = useId();
  const raLwPhysicsId = useId();
  const raSwPhysicsId = useId();
  const sfSurfacePhysicsId = useId();
  const blPblPhysicsId = useId();
  const cuPhysicsId = useId();

  const handleChange = (name, value) => {
    setFormValues({
      ...formValues,
      [name]: parseInt(value)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // 添加延迟以显示动画效果
    setTimeout(() => {
      if (onSubmit) {
        onSubmit(formValues);
      }
      setIsSubmitting(false);
    }, 200);
  };

  return (
    <Card className="w-full max-w-4xl p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">WRF物理参数设置</h2>
        <p className="text-sm text-muted-foreground mt-1">
          选择适合您模拟需求的物理参数化方案
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor={mpPhysicsId}>微物理方案 (mp_physics)</Label>
            <Select 
              defaultValue={formValues.mp_physics.toString()} 
              onValueChange={(value) => handleChange('mp_physics', value)}
            >
              <SelectTrigger id={mpPhysicsId} className="[&_[data-desc]]:hidden">
                <SelectValue placeholder="选择微物理方案" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PHYSICS_OPTIONS.mp_physics).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={raLwPhysicsId}>长波辐射 (ra_lw_physics)</Label>
            <Select 
              defaultValue={formValues.ra_lw_physics.toString()} 
              onValueChange={(value) => handleChange('ra_lw_physics', value)}
            >
              <SelectTrigger id={raLwPhysicsId} className="[&_[data-desc]]:hidden">
                <SelectValue placeholder="选择长波辐射方案" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PHYSICS_OPTIONS.ra_lw_physics).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={raSwPhysicsId}>短波辐射 (ra_sw_physics)</Label>
            <Select 
              defaultValue={formValues.ra_sw_physics.toString()} 
              onValueChange={(value) => handleChange('ra_sw_physics', value)}
            >
              <SelectTrigger id={raSwPhysicsId} className="[&_[data-desc]]:hidden">
                <SelectValue placeholder="选择短波辐射方案" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PHYSICS_OPTIONS.ra_sw_physics).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={sfSurfacePhysicsId}>地表物理 (sf_surface_physics)</Label>
            <Select 
              defaultValue={formValues.sf_surface_physics.toString()} 
              onValueChange={(value) => handleChange('sf_surface_physics', value)}
            >
              <SelectTrigger id={sfSurfacePhysicsId} className="[&_[data-desc]]:hidden">
                <SelectValue placeholder="选择地表物理方案" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PHYSICS_OPTIONS.sf_surface_physics).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={blPblPhysicsId}>边界层方案 (bl_pbl_physics)</Label>
            <Select 
              defaultValue={formValues.bl_pbl_physics.toString()} 
              onValueChange={(value) => handleChange('bl_pbl_physics', value)}
            >
              <SelectTrigger id={blPblPhysicsId} className="[&_[data-desc]]:hidden">
                <SelectValue placeholder="选择边界层方案" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PHYSICS_OPTIONS.bl_pbl_physics).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={cuPhysicsId}>积云方案 (cu_physics)</Label>
            <Select 
              defaultValue={formValues.cu_physics.toString()} 
              onValueChange={(value) => handleChange('cu_physics', value)}
            >
              <SelectTrigger id={cuPhysicsId} className="[&_[data-desc]]:hidden">
                <SelectValue placeholder="选择积云方案" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PHYSICS_OPTIONS.cu_physics).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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