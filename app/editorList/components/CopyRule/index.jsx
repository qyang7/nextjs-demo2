import {useState} from "react";
import BaseDialog from "@/components/BaseDialog.jsx";
import {Input} from "@/components/ui/input";
import {Copy} from "lucide-react";
import {Label} from "@/components/ui/label";
import {toast} from "sonner";
import {LABEL_FEATURE, LABEL_RULE} from "@/app/editor/utils";
import {addGraphNode} from "@/api/index.js";


export default function CopyRule({data, refresh}) {
    const [open, setOpen] = useState(false)
    const [label, setLabel] = useState(data?.label + '_Clone')
    const [loading, setLoading] = useState(false)


    const addSubmit = () => {
        try {
            setLoading(true)
            const draft = getFormatDraftData()
            const featureNode = draft?.nodes?.find(item => item.label === LABEL_FEATURE)
            addGraphNode({
                label,
                draft: JSON.stringify(draft),
                featureKey: featureNode?.properties?.key,
                featureName: featureNode?.properties?.name,
            }).then(res => {
                if (!res.error && (res.id !== undefined || res.id !== null)) {
                    toast.success("Success")
                    cancel()
                    refresh && refresh()
                }
            }).finally(() => {
                setLoading(false)
            })
        } catch (e) {
            toast.error('this rule editor is not valid, please add new')
            setLoading(false)
        }
    }
    const extractWithContent = (expr, factList = []) => {
        let newString = expr
        factList.forEach((fact, index) => {
            const key = fact.properties.key
            newString = newString.replaceAll(key, `{{Q${index + 1}}}`)
        })
        const list = JSON.parse(newString.split('with(')[1].replaceAll(');', '')).map(list => list[0])
        return list
    };

    const getFormatDraftData = () => {
        let draft = JSON.parse(data.draft)
        let {nodes, edges} = draft
        nodes = nodes.map(node => {
            if (node.label === LABEL_RULE) {
                const factIds = edges.filter(item => item.label === "REQUIRE" && item.target === node.id).map(item => item.source)
                const factNodes = nodes.filter(item => factIds.includes(item.id)).map(item => ({
                    ...item,
                    key: item.properties.key
                }))
                node.factList = [...factNodes]
                node.optList = extractWithContent(node.properties.expression, factNodes)
            }
            return node
        })
        return {
            nodes, edges
        }
    }


    const submit = () => {
        if (!label || !label.trim()) {
            toast.error('Please input label')
            return
        }
        addSubmit()
    }

    const cancel = () => {
        setLoading(false)
        setOpen(false)
        setLabel(data?.label + '_Clone')
    }


    return <>
        <Copy size={18} className={'cursor-pointer'} onClick={() => {
            setOpen(true)
        }}/>
        {
            open && <BaseDialog open={open} title={'Clone Rule Editor'}
                                width={800}
                                onCancel={cancel}
                                loading={loading}
                                onOk={submit}>
                <Label className={'mt-5'}>New Rule Editor Label:</Label>
                <Input
                    required={true}
                    value={label}
                    onChange={(e) => {
                        setLabel(e.target.value)
                    }}
                    style={{border: '1px solid #ddd', width: '95%'}}
                    placeholder={'input title'}
                />
            </BaseDialog>
        }
    </>
}
