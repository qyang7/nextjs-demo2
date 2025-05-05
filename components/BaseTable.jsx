import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Skeleton} from "@/components/ui/skeleton";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import {useEffect, useMemo, useState} from "react";
import {Squirrel} from "lucide-react";

export default function BaseTable({columns = [], dataSource = [], queryFun, params}) {
    const [list, setList] = useState([])
    const [pageIndex, setPageIndex] = useState(0)
    const [totalPage, setTotalPage] = useState(0)
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!queryFun){
            setList(dataSource || [])
        }
    }, [dataSource, queryFun]);

    const queryData=(index)=>{
        if (queryFun && !loading){
            setLoading(true)
            queryFun({
                page:index !== undefined ? index : pageIndex,
                size:10
            }).then(res => {
                const {data, total, totalPage} = res
                setTotal(total)
                setTotalPage(totalPage)
                setList(data)
            }).finally(()=>setLoading(false))
        }
    }

    const totalPageList = useMemo(()=>
        Array(totalPage).fill(undefined).map((_, index) => index+1) || [],[totalPage])


    useEffect(() => {
        queryData()
    }, [pageIndex]);

    useEffect(()=>{
        setPageIndex(0)
        queryData(0)
    },[params])


    return loading ? <div className="space-y-4 pt-10">
        <Skeleton className="h-4 w-[250px]"/>
        <Skeleton className="h-4 w-[200px]"/>
        <Skeleton className="h-4 w-[250px]"/>
        <Skeleton className="h-4 w-[200px]"/>
    </div> : <div >
        <Table style={{width: '100%'}}>
            <TableHeader>
                <TableRow className={'bg-gray-100 font-bold'}>
                    {
                        columns.map((item, index) => <TableHead key={'TableHead'+index}>{item.title}</TableHead>)
                    }
                </TableRow>
            </TableHeader>
            {
                list?.length > 0 && <TableBody>
                    {list?.map((item, idx) => {
                        return <TableRow key={'TableRow'+idx} style={{border: '1px solid #f0f0f0'}}>
                            {columns.map(column =>
                                <TableCell key={'TableRow'+idx + 'TableCell'+column.key}>
                                    {column.type === 'index' ? idx + 1 : column.render ? column.render(item[column.key], item, idx) : item[column.key]}
                                </TableCell>)}
                        </TableRow>
                    })}
                </TableBody>
            }

        </Table>
        {
          (!list || list.length === 0) && <div className={'flex justify-center items-center h-[200px]'}>
                <div className={'flex flex-col items-center'}>
                    <Squirrel className={'text-gray-400'} size={'50px'}/>
                    <div className={'text-gray-400 text-sm'}>No Data</div>
                </div>
            </div>
        }
        {queryFun !== undefined && <div className={'flex justify-between text-gray-600 items-center'}>
            <div className={'whitespace-nowrap h-5 text-sm'}>Total: {total}</div>
            <Pagination className={'justify-end cursor-pointer'}>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious onClick={() => {
                            if (pageIndex >= 1) {
                                setPageIndex(pageIndex - 1)
                            }
                        }}/>
                    </PaginationItem>
                    {
                        totalPageList?.map(page => <PaginationItem key={'PaginationItem'+page}>
                            <PaginationLink
                              isActive={page - 1 === pageIndex}
                              style={{border: page - 1 === pageIndex ? '1px solid hsl(var(--input))' : ''}}
                              onClick={() => {
                                setPageIndex(page - 1)
                            }}>{page}</PaginationLink>
                        </PaginationItem>)
                    }
                    <PaginationItem>
                        <PaginationNext onClick={() => {
                            if (pageIndex < (totalPage - 1)) {
                                setPageIndex(pageIndex + 1)
                            }
                        }}/>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>}
    </div>
}