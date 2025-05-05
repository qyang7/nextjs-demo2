import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import React from "react";


export default function BaseFormItemSelect({label,  des='', name, control, placeholder='please select',
                                               defaultValue, options=[],onChange=()=>{}}) {
  return (
      <FormField
          control={control}
          name={name}
          render={({ field }) => (
              <FormItem>
                  <FormLabel>{label}</FormLabel>
                  <FormControl>
                      <Select onValueChange={data=>{
                          field.onChange(data)
                          onChange(data)
                      }} defaultValue={defaultValue}>
                          <FormControl>
                              <SelectTrigger>
                                  <SelectValue placeholder={placeholder} />
                              </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                              {options.map(item =>  <SelectItem value={item.value} key={item.value}>{item.label}</SelectItem>)}
                          </SelectContent>
                      </Select>
                  </FormControl>
                  <FormDescription>{des}</FormDescription>
                  <FormMessage />
              </FormItem>
          )}
      />
  );
}