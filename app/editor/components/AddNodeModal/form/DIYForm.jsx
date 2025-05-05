"use client"

import {Form} from "@/components/ui/form";
import {useForm} from "react-hook-form";
import BaseFormItemInput from "@/components/BaseFormItemInput.jsx";
import {Button} from "@/components/ui/button";
import {useState} from "react";

const DIYForm = ({ submit = () => {}, close = () => {}, originData }) => {
    const form = useForm({
        defaultValues: {
            name: originData ? (originData.properties?.name || originData?.name || '') : '',
            desc: originData ? (originData.properties?.desc || originData?.desc || '') : '',
            customType: originData ? (originData.properties?.customType || originData?.customType || '') : '',
        }
    });
    const [customType, setCustomType] = useState(originData?.properties?.customType || '');

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
                <BaseFormItemInput control={form.control} name={'name'} label={'Name'} required={true}/>
                <BaseFormItemInput control={form.control} name={'desc'} label={'Description'}/>
                <BaseFormItemInput
                    control={form.control}
                    name={'customType'}
                    label={'Type Name'}
                    required={true}
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                />
                <div className={'space-x-4'}>
                    <Button type={'submit'}>Submit</Button>
                    <Button variant="outline" onClick={close}>Cancel</Button>
                </div>
            </form>
        </Form>
    );
};

export default DIYForm;