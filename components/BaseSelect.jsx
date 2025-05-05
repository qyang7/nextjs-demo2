import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

export default function BaseSelect({options, defaultValue,value, onChange, className, disabled, placeholder=''}) {
  return (
      <Select onValueChange={onChange} defaultValue={defaultValue} disabled={disabled} value={value}>
          <SelectTrigger className={className} >
              <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
              <SelectGroup>
                  {
                      options.map(option => <SelectItem value={option.value} key={option.value}>
                          {option.label}
                      </SelectItem>)
                  }
              </SelectGroup>
          </SelectContent>
      </Select>
  );
}
