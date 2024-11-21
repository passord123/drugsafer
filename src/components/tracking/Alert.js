const Alert = ({ children, variant = 'default' }) => {
    const colors = {
        default: 'bg-gray-100 text-gray-800 border-gray-200',
        destructive: 'bg-red-50 text-red-800 border-red-200',
        warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
        success: 'bg-green-50 text-green-800 border-green-200'
    };

    return (
        <div className={`p-4 rounded-lg border ${colors[variant]} flex items-center gap-2`}>
            {children}
        </div>
    );
};

export default Alert