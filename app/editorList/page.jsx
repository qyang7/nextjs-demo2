"use client"
import dayjs from "dayjs";
import {Button} from "@/components/ui/button";
import {PlusCircle, Trash2, ArrowUpFromLine, Copy, Edit} from "lucide-react";
import { useRouter } from "next/navigation";
import BaseTable from "@/components/BaseTable.jsx";
import {deleteGraphNode, publishGraphNode, queryNodeList} from "@/api";
import {toast} from "sonner";
import {useState} from "react";
import BaseLoadingIcon from "@/components/BaseLoadingIcon";
import DoubleConfirmDelete from "@/components/DoubleComfirmDelete.jsx";
import CopyRule from "@/app/editorList/components/CopyRule";

export default function EditorList() {
    const router = useRouter(); // Replaced useNavigate with useRouter
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [publishLoading, setPublishLoading] = useState(false);
    const [params, setParams] = useState({});

    const deleteNodeById = (id) => {
        setDeleteLoading(true);
        deleteGraphNode({id}).then(res => {
            if (res.id !== null || res.id !== undefined) {
                toast.success("Success");
                setParams({...params});
            }
        }).finally(() => setDeleteLoading(false));
    };

    const publish = (record) => {
        const nodeObj = JSON.parse(record.draft);
        const data = {
            sessionId: '',
            id: record.id,
            edges: nodeObj?.edges,
            nodes: nodeObj?.nodes.map((item) => {
                const obj = item;
                delete obj.optList;
                delete obj.factList;
                return obj;
            })
        };
        setPublishLoading(true);
        publishGraphNode(data).then(res => {
            if (res?.data) {
                toast.success("Success");
                setParams({...params});
            }
        }).finally(() => setPublishLoading(false));
    };

    const columns = [
        {
            title: "",
            key: "id",
            type: "index"
        },
        {
            title: "Label",
            key: "label",
            render: (text, record) => {
                return <Button
                  variant="link"
                  style={{background: 'transparent', border: "unset", color: '#027aff', cursor: 'pointer', padding: 'unset'}}
                  onClick={() => {
                  router.push(`/editor?id=${record.id}&read=1`); // Updated navigation
                }}>{record.label}</Button >
            }
        },
        {
            title: "Update at",
            key: "updateAt",
            render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss')
        },
        {
            title: "Status",
            key: "statusText",
        },
        {
            title: "Action",
            key: "action",
            render: (text, record) => {
                return <div className={'space-x-4 text-gray-600 flex'}>
                    {
                        record.status === 0 ? <>
                            <Edit size={18} className={'cursor-pointer'}
                                    onClick={() => {
                                        console.log(record, JSON.parse(record.draft));
                                        router.push(`/editor?id=${record.id}`); // Updated navigation
                                    }}/>
                            <BaseLoadingIcon loading={deleteLoading} key={record.id}>
                                <DoubleConfirmDelete onDelete={()=>{
                                    deleteNodeById(record.id);
                                }}/>
                            </BaseLoadingIcon>
                            <BaseLoadingIcon loading={publishLoading}>
                                <ArrowUpFromLine size={18} className={'cursor-pointer'} onClick={() => publish(record)}/>
                            </BaseLoadingIcon>
                        </> : <>
                           <CopyRule data={record} refresh={()=>{
                               setParams({...params});
                           }}/>
                        </>
                    }
                </div>
            }
        }
    ];

    return <div>
        <div className={'flex justify-between items-center mb-2'}>
            <div className={'font-bold'}>Rule Editor</div>
            <Button onClick={() => router.push('/editor')}><PlusCircle/>Add</Button> {/* Updated navigation */}
        </div>
        <BaseTable columns={columns} queryFun={queryNodeList} params={params}/>
    </div>
}