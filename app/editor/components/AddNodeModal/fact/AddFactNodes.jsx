"use client"

import {useState} from "react";
import {Button} from "@/components/ui/button";
import {PlusCircle} from "lucide-react";
import {generateUUID} from "@/app/editor/service.js";
import FactTableShow from "@/app/editor/components/AddNodeModal/fact/FactTableShow.jsx";
import AddNodeModal from "@/app/editor/components/AddNodeModal";


const FactNodesControl = ({
                              factList = [],
                              setFactList = () => {
                              }
                          }) => {
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState(null)

    const addFact = (data) => {
        const newFactList = [
            ...factList,
            {
                ...data,
                id: generateUUID()
            }
        ];
        setFactList(newFactList);
    }

    const updateFact = (data) => {
        const newFactList = factList.map(item => {
            const currentKey = editData.key
            if (item.key === currentKey) {
                return {
                    ...editData,
                    ...data,
                    key: currentKey,
                    properties: {
                        ...data.properties,
                        key: currentKey,
                    }
                };
            }
            return item;
        });
        setFactList(newFactList);
    }

    return (
        <>
            <div>
                <div className={'flex justify-between items-center'}>
                    <div className={'font-bold'}>FactList</div>
                    <div style={{marginBottom: '10px',}}>
                        <Button onClick={() => {
                            setOpen(true)
                            setEditData(null)
                        }}>
                            <PlusCircle/>
                            <span>Add Fact Node</span>
                        </Button>
                    </div>
                </div>
                <FactTableShow factList={factList} setFactList={setFactList} handleEdit={da => {
                    setEditData(da)
                    setOpen(true)
                }}/>
            </div>

            {
                open && <AddNodeModal
                    data={editData || {}}
                    type={'FACT'}
                    onCancel={() => setOpen(false)}
                    updateData={data => {
                        setOpen(false);
                        if (!!editData) {
                            updateFact(data)
                        } else {
                            addFact(data)
                        }
                    }}
                />
            }
        </>
    );
};

export default function AddFactNodes({factList, setFactList}) {
    return <FactNodesControl factList={factList} setFactList={setFactList}/>
}