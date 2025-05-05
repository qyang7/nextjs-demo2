"use client"

import {addGraphNode, updateGraphNode} from "@/api/index.js";
import {Button} from "@/components/ui/button";
import {useEffect, useState} from "react";
import { useRouter } from "next/navigation"; // 替换 useNavigate
import BaseDialog from "@/components/BaseDialog.jsx";
import {Input} from "@/components/ui/input";
import {toast} from "sonner";
import {LABEL_FEATURE} from "@/app/editor/utils";

export default function DraftHandleButton({data, id, nodeLabel}) {
    const router = useRouter(); // 使用 useRouter 替代 useNavigate
    const [open, setOpen] = useState(false);
    const [label, setLabel] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLabel(nodeLabel);
    }, [nodeLabel]);

    const addSubmit = () => {
        const featureNode = data?.nodes?.find(item => item.label === LABEL_FEATURE);
        setLoading(true);
        addGraphNode({
            label,
            draft: JSON.stringify(data),
            featureKey: featureNode?.properties?.key,
            featureName: featureNode?.properties?.name,
        }).then(res => {
            if (!res.error && (res.id !== undefined || res.id !== null)) {
                toast.success("Success");
                router.push('/editor/list'); // 使用 router.push 进行导航
            }
        }).finally(() => {
            setLoading(false);
        });
    };

    const editSubmit = () => {
        const featureNode = data?.nodes?.find(item => item.label === LABEL_FEATURE);
        setLoading(true);
        updateGraphNode({
            id,
            label,
            draft: JSON.stringify(data),
            featureKey: featureNode?.properties?.key,
            featureName: featureNode?.properties?.name,
        }).then(res => {
            if ((res?.id !== undefined || res?.id !== null)) {
                toast.success("Success");
                router.push('/editor/list'); // 使用 router.push 进行导航
            }
        }).finally(() => {
            setLoading(false);
        });
    };

    const submit = () => {
        if (!label || !label.trim()) {
            toast.error('Please input label');
            return;
        }
        if (!id) {
            addSubmit();
        } else {
            editSubmit();
        }
    };

    const cancel = () => {
        setOpen(false);
        setLabel(nodeLabel || '');
    };

    return <>
        <Button style={{marginRight: '10px'}} onClick={() => setOpen(true)} size={'sm'}
                type={'primary'}>Save Draft</Button>
        {
            open && <BaseDialog open={open} title={'Input Graph Title'}
                                width={800}
                                onCancel={cancel}
                                loading={loading}
                                onOk={submit}>
                <Input
                    required={true}
                    value={label}
                    onChange={(e) => {
                        setLabel(e.target.value);
                    }}
                    style={{border: '1px solid #ddd', width: '95%'}}
                    placeholder={'input title'}
                />
            </BaseDialog>
        }
    </>;
}