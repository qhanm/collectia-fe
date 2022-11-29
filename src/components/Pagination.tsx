import React from "react";

interface Props {
    pageIndex: number,
    pageCount: number,
    onChange: Function,
    onPrevious?: Function,
    onNext?: Function,
}

const Pagination: React.FC<Props> = ({
    pageIndex,
    pageCount,
    onChange,
}) => {

    const renderListPage = () => {
        const arrContent: any = [];
        for(let i = 0; i < pageCount; i++)
        {
            arrContent.push(
                <li
                    style={{cursor: 'pointer'}}
                    className={`page-item ${pageIndex === (i+1) ? 'active' : ''} `}
                    key={i}
                    onClick={() => {
                        if(i > 0 && i < pageCount && pageIndex != (i + 1)){
                            onChange(i+1);
                        }
                    }}
                >
                    <a className="page-link">
                        { i + 1 }
                    </a>
                </li>
            )
        }

        return arrContent;
    }

    return (
        <ul className="pagination">
            {/*<li*/}
            {/*    className="page-item disabled"*/}
            {/*    onClick={() => {*/}

            {/*    }}*/}
            {/*>*/}
            {/*    <a className="page-link" href="#" aria-disabled="true">Previous</a>*/}
            {/*</li>*/}
            {
                renderListPage()
            }
            {/*<li*/}
            {/*    className="page-item"*/}
            {/*    onClick={() => {*/}

            {/*    }}*/}
            {/*>*/}
            {/*    <a className="page-link" href="#">Next</a>*/}
            {/*</li>*/}
        </ul>
    )
}

export default Pagination;
