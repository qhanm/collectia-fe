import React from "react";

interface Props {
    label?: string,
    value?: string|number,
    required?: boolean,
    onChange?: Function,
    error?: string|null|undefined|any,
    name?: string,
    type?: 'text'|'password'|'hidden'|'number'|any,
    placeholder?: string,
    ref?: any,
    disable?: boolean,
}

const Input: React.FC<Props> = ({
    label,
    value,
    error,
    onChange,
    required,
    name,
    type = 'text',
    placeholder,
    ref,
    disable = false
}) => {

    return (
        <>
            <div className="control-group mb-3 mt-3">
                { label && <label className="form-label" htmlFor={name}>
                    { label }
                    { required && <span className="text-danger"> *</span> }
                </label> }
                <div className="controls">
                    <input
                        disabled={disable}
                        ref={ref}
                        className="form-control"
                        type={type}
                        placeholder={placeholder}
                        name={name}
                        value={value}
                        onChange={(e: any) => { onChange && onChange(e) }}
                    />
                    {
                        error?.length && (
                            <span
                                className="text-error field-validation-valid text-danger"
                            >
                                { error }
                            </span>
                        )
                    }
                </div>
            </div>
        </>
    )
}

export default Input;
