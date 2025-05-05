import React, {useEffect, useState} from 'react';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {Check} from 'lucide-react';

const BaseSelectMulti = ({options, label, disabled, className, onChange, value=[]}) => {
    const [selectedOptions, setSelectedOptions] = useState([]);

    const handleOptionSelect = (option, e) => {
        e.stopPropagation();
        if (selectedOptions.some((selected) => selected.value === option.value)) {
            setSelectedOptions(selectedOptions.filter((selected) => selected.value !== option.value));
        } else {
            setSelectedOptions([...selectedOptions, option]);
        }
    };

    useEffect(() => {
        onChange && onChange(selectedOptions.map(it => it.value));
    }, [selectedOptions]);

    useEffect(() => {
        const newSelectedOptions = options.filter(option => value.includes(option.value));
        setSelectedOptions(newSelectedOptions);
    }, []);

    return (
        <Select disabled={disabled}>
            <SelectTrigger className={className}>
                {/*<SelectValue placeholder={label}>*/}
                {/*    {selectedOptions.length > 0*/}
                {/*        ? selectedOptions.map((option) => option.label).join(', ')*/}
                {/*        : label}*/}
                {/*</SelectValue>*/}
                <div className={'overflow-x-hidden'}> {selectedOptions.length > 0
                    ? selectedOptions.map((option) => option.label).join(', ')
                    : label}</div>

            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {options.map((option) => {
                        const isSelected = selectedOptions.some((selected) => selected.value === option.value);
                        return (
                            <SelectItem
                                key={option.value}
                                value={option.value}
                                onMouseDown={(e) => handleOptionSelect(option, e)}
                                className={`${isSelected ? 'bg-gray-100' : ''}`}
                            >
                                {isSelected && <Check className="mr-2 h-4 w-4"/>}
                                {option.label}
                            </SelectItem>
                        );
                    })}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
};

export default BaseSelectMulti;