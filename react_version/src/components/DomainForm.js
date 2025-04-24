import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { useToast } from "./ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { CheckCircle } from "lucide-react";

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
  const { toast } = useToast();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormValues({
      ...formValues,
      [name]: type === "number" ? parseFloat(value) : value,
    });
  };

  const handleFormSubmit = () => {
    // Prevent form from actually submitting
    setIsSubmitting(true);
    console.log("Form submitted without page refresh, values:", formValues);
    
    // 添加点击反馈效果
    setTimeout(() => {
      if (onSubmit) {
        console.log("Calling parent onSubmit function");
        onSubmit(formValues);
      } else {
        console.log("No parent onSubmit function, showing custom alert");
        // 自定义成功消息
        setShowSuccessAlert(true);
        setTimeout(() => {
          setShowSuccessAlert(false);
        }, 3000);
        
        // Always show toast
        toast({
          title: "域设置已保存",
          description: "您可以继续下一步配置",
          variant: "default",
        });
      }
      setIsSubmitting(false);
    }, 200);
  };

  return (
    <Card className="w-full max-w-3xl p-6">
      <h2 className="text-2xl font-bold mb-6">WRF域配置</h2>
      
      {showSuccessAlert && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <div>
              <AlertTitle className="text-green-700">设置已保存</AlertTitle>
              <AlertDescription className="text-green-600">
                您的域设置已成功保存，可以继续下一步配置。
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}
      
      <Form>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Grid dimensions */}
            <FormField
              name="e_we"
              render={() => (
                <FormItem>
                  <FormLabel>E_WE (西-东方向网格点数)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      name="e_we"
                      value={formValues.e_we}
                      onChange={handleChange}
                      min="3"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="e_sn"
              render={() => (
                <FormItem>
                  <FormLabel>E_SN (南-北方向网格点数)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      name="e_sn"
                      value={formValues.e_sn}
                      onChange={handleChange}
                      min="3"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Grid spacing */}
            <FormField
              name="dx"
              render={() => (
                <FormItem>
                  <FormLabel>DX (x方向网格间距, 千米)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      name="dx"
                      value={formValues.dx}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="dy"
              render={() => (
                <FormItem>
                  <FormLabel>DY (y方向网格间距, 千米)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      name="dy"
                      value={formValues.dy}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reference coordinates */}
            <FormField
              name="ref_lat"
              render={() => (
                <FormItem>
                  <FormLabel>参考纬度 (度)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      name="ref_lat"
                      value={formValues.ref_lat}
                      onChange={handleChange}
                      step="0.000001"
                      min="-90"
                      max="90"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="ref_lon"
              render={() => (
                <FormItem>
                  <FormLabel>参考经度 (度)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      name="ref_lon"
                      value={formValues.ref_lon}
                      onChange={handleChange}
                      step="0.000001"
                      min="-180"
                      max="180"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Projection parameters */}
            <FormField
              name="truelat1"
              render={() => (
                <FormItem>
                  <FormLabel>第一标准纬度 (度)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      name="truelat1"
                      value={formValues.truelat1}
                      onChange={handleChange}
                      step="0.000001"
                      min="-90"
                      max="90"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="truelat2"
              render={() => (
                <FormItem>
                  <FormLabel>第二标准纬度 (度)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      name="truelat2"
                      value={formValues.truelat2}
                      onChange={handleChange}
                      step="0.000001"
                      min="-90"
                      max="90"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="stand_lon"
              render={() => (
                <FormItem>
                  <FormLabel>标准经度 (度)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      name="stand_lon"
                      value={formValues.stand_lon}
                      onChange={handleChange}
                      step="0.000001"
                      min="-180"
                      max="180"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="max_dom"
              render={() => (
                <FormItem>
                  <FormLabel>最大域数量</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      name="max_dom"
                      value={formValues.max_dom}
                      onChange={handleChange}
                      min="1"
                      max="10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Projection type */}
            <FormField
              name="map_proj"
              render={() => (
                <FormItem className="col-span-1 md:col-span-2">
                  <FormLabel>地图投影方式</FormLabel>
                  <div className="relative">
                    <select
                      className="w-full h-9 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                      name="map_proj"
                      value={formValues.map_proj}
                      onChange={handleChange}
                    >
                      <option value="lambert">Lambert Conformal</option>
                      <option value="polar">Polar Stereographic</option>
                      <option value="mercator">Mercator</option>
                      <option value="lat-lon">Lat-Lon</option>
                    </select>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </span>
                  </div>
                  <FormDescription>
                    选择WRF域的地图投影方式
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end">
            <Button 
              type="button" 
              onClick={handleFormSubmit}
              className={`relative ${isSubmitting ? 'opacity-80 scale-95' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? '保存中...' : '保存配置'}
            </Button>
          </div>
        </div>
      </Form>
    </Card>
  );
};

export default WrfDomainForm; 