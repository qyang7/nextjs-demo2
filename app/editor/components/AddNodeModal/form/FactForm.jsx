"use client"

import {useState, useEffect} from "react";
import {Button} from "@/components/ui/button";
import BaseFormItemInput from "@/components/BaseFormItemInput.jsx";
import BaseFormItemSelect from "@/components/BaseFormItemSelect.jsx";
import {useForm} from "react-hook-form";
import {Form} from "@/components/ui/form";
import {Textarea} from "@/components/ui/textarea";
import {PlusCircle, Trash2, Wrench} from "lucide-react";
import BaseFormItemTextArea from "@/components/BaseFormItemTextArea.jsx";

const DefaultOptionType = 'radio'
const RadioOptions = ['true', 'false']


const Answers = ({tagValue = DefaultOptionType, onChange, originData = []}) => {
    const [choices, setChoices] = useState(originData || RadioOptions);
    const [useBoolean, setUseBoolean] = useState(true)

    useEffect(() => {
        if (originData?.length) { // edit
            if (tagValue === DefaultOptionType) {
                if (originData.length === 2 && originData.includes('true') && originData.includes('false')) {
                    setUseBoolean(true)
                } else {
                    setUseBoolean(false)
                }
            }
        } else { // add
            if (tagValue === DefaultOptionType) {
                setUseBoolean(true)
                setChoices(RadioOptions)
            } else {
                setChoices([])
            }
        }
    }, [])

    useEffect(() => {
        if (tagValue === DefaultOptionType && !originData?.length) {
            setChoices(RadioOptions)
        } else {
            setChoices(originData || [])
        }
    }, [tagValue])

    useEffect(() => {
        onChange && onChange(choices || [])
    }, [choices]);

    const handleAddChoice = () => {
        setChoices([...choices, '']);
    };

    const handleChoiceChange = (index, value) => {
        const newChoices = [...choices];
        newChoices[index] = value;
        setChoices(newChoices);
    };

    const handleDeleteChoice = (index) => {
        const newChoices = choices.filter((_, i) => i !== index);
        setChoices(newChoices);
    };

    return <div>
        <div className={'flex justify-between items-center mb-2'}>
             <span>
                 <b className={'mr-2'}>Answers:</b>
                 {
                     tagValue === 'radio' && (useBoolean ?
                         <Button variant="outline" size={'sm'} type={'button'}
                                 onClick={() => setUseBoolean(false)}><Wrench/>DIY</Button> :
                         <Button variant="outline" size={'sm'} type={'button'} onClick={() => {
                             setUseBoolean(true)
                             setChoices(RadioOptions)
                         }}><Wrench/>Use
                             TRUE/FALSE</Button>)
                 }

             </span>
            {
                (!useBoolean || tagValue !== 'radio') &&
                <Button onClick={handleAddChoice} variant="outline" size={'sm'} type={'button'}><PlusCircle/>Add Choice</Button>
            }
        </div>

        {useBoolean && tagValue === 'radio' ?
            <div>{choices.join(',')}</div> :
            (
                <div>
                    {choices.map((item, index) => <div key={index} className={'flex items-end mb-1'}>
                        <Textarea placeholder={'please input answer choice'} required={true}
                                  value={item}
                                  onChange={(e) => {
                                      handleChoiceChange(index, e.target.value)
                                  }}
                                  style={{marginRight: 8}}/>

                        {choices.length > 1 &&
                            <Button size={'sm'} onClick={() => handleDeleteChoice(index)} variant="outline">
                                <Trash2/>Delete
                            </Button>}
                    </div>)}
                </div>
            )}
    </div>
}

export default function FactForm({submit, close, originData}) {
    const form = useForm({
        defaultValues:{
            name: originData ? (originData.properties?.name || ''):'',
            scope: originData ? (originData.properties?.scope || ''):'',
            prompt: originData ? (originData.properties?.prompt || ''):'',
            option_type: originData ? (originData.properties?.option_type || DefaultOptionType):DefaultOptionType
        }
    })
    const [tagValue, setTagValue] = useState(DefaultOptionType);
    const [choices, setChoices] = useState([]);

    useEffect(() => {
        if (originData) {
            const type = originData.properties?.option_type
            setTagValue(type)
            setChoices(originData?.properties?.options || [])
        }
    }, [originData]);

    const handleTagChange = (value) => {
        setTagValue(value);
    };

    const mySubmit = () => {
        const data = form.getValues()
        const newData = {
            ...data,
            option_type: data.option_type || DefaultOptionType,
            options: choices
        }
        console.log(form.getValues(), newData, '==haha fact node data')
        submit && submit(newData)
    }

    return <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(mySubmit)}>
            <BaseFormItemInput control={form.control} name={'name'} label={'Name'} required={true}/>
            <BaseFormItemInput control={form.control} name={'scope'} label={'Scope'}/>
            <BaseFormItemTextArea control={form.control} name={'prompt'} label={'prompt'} required={true}/>
            <BaseFormItemSelect control={form.control} name={'option_type'} label={'option_type'}
                                options={['radio', 'checkbox'].map(item => ({label: item, value: item}))}
                                defaultValue={originData.properties?.option_type || DefaultOptionType}
                                onChange={handleTagChange}
            />

            <Answers tagValue={tagValue} onChange={setChoices} originData={originData.properties?.options}/>
            <div className={'space-x-4'} style={{marginTop: '50px'}}>
                <Button type={'submit'}>Confirm</Button>
                <Button variant="outline" onClick={close}>Close</Button>
            </div>
        </form>
    </Form>
}
