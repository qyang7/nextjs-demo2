"use client"

import {Form} from "@/components/ui/form";
import {useForm} from "react-hook-form";
import BaseFormItemInput from "@/components/BaseFormItemInput.jsx";
import {Button} from "@/components/ui/button";

export default function RuleForm({
                                        submit = () => {
                                        },
                                        close = () => {
                                        },
                                        footer, children, originData
                                    }) {
    const form = useForm({
        defaultValues:{
            name: originData ? (originData.properties?.name || originData?.name || ''):''
        }
    })

    return <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
            <BaseFormItemInput control={form.control} name={'name'} label={'Name'} required={true}/>
            {children}
            <div className={'space-x-4'}>
                {
                    footer ? footer : <>
                        <Button type={'submit'}>Confirm</Button>
                        <Button variant="outline" onClick={close}>Close</Button>
                    </>
                }
            </div>
        </form>
    </Form>
}
