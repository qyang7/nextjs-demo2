"use client"

import {useEffect, useMemo, useState} from "react";
import FactForm from "./form/FactForm.jsx";
import RuleModalContent from "./rule/RuleModalContent.jsx";
import {betterUUID} from "@/utils/common.js";
import BaseDialog from "@/components/BaseDialog.jsx";

import {LABEL_SWITCH, isNodeType,
    LABEL_DIY,
    LABEL_FACT,
    LABEL_FEATURE,
    LABEL_GAP,
    LABEL_RULE,} from "@/app/editor/utils";
import NodeTypeSelectShow from "@/app/editor/components/AddNodeModal/NodeTypeSelectShow";
import DIYForm from "@/app/editor/components/AddNodeModal/form/DIYForm";
import FeatureForm from "@/app/editor/components/AddNodeModal/form/FeatureForm";
import GapForm from "@/app/editor/components/AddNodeModal/form/GapForm";


const AddNodeModal = ({data, updateData, onCancel, type}) => {
    const [ruleForm, setRuleForm] = useState(null)
    const [typeValue, setTypeValue] = useState(type || LABEL_FEATURE)
    const [open, setOpen] = useState(false)

    const isEdit = useMemo(() => {
        return !!data?.properties?.key
    }, [data])

    const editNodeType = useMemo(() => {
        return data?.label || data?.type
    }, [data])

    useEffect(() => {
        setTypeValue(editNodeType || type || LABEL_FEATURE)
    }, [data, editNodeType])


    useEffect(() => {
        setOpen(!!data)
    }, [data])


    const finish = (values) => {
        const type = values.customType || (editNodeType || typeValue);
        const key = betterUUID()
        let formData = {
            ...data,
            key,
            name: values.name,
            type: type,
            label: type,
            properties: {
                ...values,
                key,
            },
            isAdd: true
        }
        delete formData.properties.type
        console.log('add node data:', formData)
        updateData && updateData(formData)
    }

    const cancel = () => {
        setTypeValue('')
        setOpen(false)
    }

    const isRule = useMemo(() => {
        return typeValue === LABEL_RULE
    }, [typeValue])

    if (open) {
        if (isRule) {
            return <BaseDialog open={open}
                               title={isEdit ? 'Edit Node' : 'Add Node'}
                               width={800}
                               footer={null}
                               onCancel={() => {
                                   cancel()
                                   onCancel && onCancel()
                               }}
                               onOk={ruleForm?.submit}>
                <NodeTypeSelectShow defaultType={editNodeType || type} seType={setTypeValue}/>
                <div className={'w-full h-0.5 bg-gray-100'} style={{marginBottom: '0'}}></div>
                <RuleModalContent data={data}
                                  onClose={() => {
                                      cancel()
                                      onCancel && onCancel()
                                  }}
                                  onChange={val => {
                                      updateData && updateData(val)
                                      cancel()
                                  }}
                                  setRuleForm={setRuleForm}/>
            </BaseDialog>
        }

        return <BaseDialog open={open}
                           title={isEdit ? 'Edit Node' : 'Add Node'}
                           footer={false}
                           width={[LABEL_FACT].includes(typeValue) ? 1000 : 500}
                           onCancel={() => {
                               cancel()
                               onCancel && onCancel()
                           }}
        >

            <NodeTypeSelectShow defaultType={editNodeType || type} seType={setTypeValue}/>

            {(LABEL_DIY === typeValue || isNodeType(typeValue)) && (
                <DIYForm
                    originData={data}
                    submit={finish}
                    close={() => {
                        cancel();
                        onCancel && onCancel();
                    }}
                />
            )}
            {LABEL_FEATURE === typeValue && (
                <FeatureForm
                    originData={data}
                    submit={finish}
                    close={() => {
                        cancel();
                        onCancel && onCancel();
                    }}
                />
            )}

            {LABEL_SWITCH === typeValue && (
                <FeatureForm
                    originData={data}
                    submit={finish}
                    close={() => {
                        cancel();
                        onCancel && onCancel();
                    }}
                />
            )}

            {LABEL_GAP === typeValue &&
                <GapForm
                    originData={data}
                    submit={finish}
                    close={() => {
                        cancel()
                        onCancel && onCancel()
                    }}/>}

            {LABEL_FACT === typeValue && <FactForm
                originData={data}
                submit={finish}
                close={() => {
                    cancel()
                    onCancel && onCancel()
                }}/>}

        </BaseDialog>
    }
}
export default AddNodeModal
