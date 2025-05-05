import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";


export default function BaseFormItemInput({label,  des='', name, control, placeholder='please input', required=false}) {
  return (
      <FormField
          control={control}
          name={name}
          render={({ field }) => (
              <FormItem>
                  <FormLabel>{label}</FormLabel>
                  <FormControl>
                      <Input placeholder={placeholder}
                             {...field}
                             required={required}
                             className={'w-full p-0 pl-2'}
                             style={{width:'100%', border:'1px solid #d9d9d9'}}/>
                  </FormControl>
                  <FormDescription>{des}</FormDescription>
                  {/*<FormMessage  className="FormMessage" match="valueMissing">*/}
                  {/*    Please input*/}
                  {/*</FormMessage>*/}
              </FormItem>
          )}
      />
  );
}