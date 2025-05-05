"use client"

import CopyText from "@/components/CopyText.jsx";
import {Edit, Trash2} from "lucide-react";
import BaseTable from "@/components/BaseTable.jsx";
import DoubleConfirmDelete from "@/components/DoubleComfirmDelete.jsx";

const FactTableShow = ({
                                  factList,
                                  setFactList,
                                  handleEdit = () => {
                                  },
                                  canEdit = true
                              }) => {
    const columns = [
        {
            title: 'Index',
            key: 'index',
            render: (_, __, index) => {
                const text = `{{Q${index + 1}}}`;
                return <div className={'flex items-center w-14'}>
                    <span>{text}</span>
                    <CopyText copyable={{text}} className={'ml-1 mt-1'}/>
                </div>
            },
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (_, record) => <div className={'break-all'}>
                {record.properties.name}
            </div>
        },
        {
            title: 'Prompt',
            dataIndex: 'prompt',
            key: 'prompt',
            render: (_, record) => <div className={'break-all'}>{record.properties.prompt}</div>
        },
        {
            title: 'Options',
            dataIndex: 'options',
            key: 'options',
            render: (_, record) => <div className={'break-all'}>{
                record.properties.options.map((str, index) => <div key={index} className={'mb-2'}>{index + 1}.{str}</div>)
            }</div>
        }
    ].concat(canEdit ? [
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: (_, record) => <div className={'w-10 space-x-2'}>
                <Edit size={16} className={'cursor-pointer'} onClick={() => {
                    handleEdit(record)
                }}/>
                <Trash2 size={16} className={'cursor-pointer text-red-500'} onClick={() => {
                    setFactList(factList.filter(item => item.key !== record.key))
                }}/>
            </div>
        }
    ] : [])

    return (
        <BaseTable
            columns={columns}
            dataSource={factList}
        />
    );
};

export default FactTableShow