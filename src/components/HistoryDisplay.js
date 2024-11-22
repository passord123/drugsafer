const HistoryDisplay = ({ drug, showHistory, onClose }) => {
    console.log('HistoryDisplay drug:', drug); // Debug log
    console.log('HistoryDisplay doses:', drug?.doses); // Debug log

    if (!showHistory) return null;

    return (
        <MobileModal
            isOpen={showHistory}
            onClose={onClose}
            title={`Dose History - ${drug.name}`}
            fullScreen
        >
            <div className="flex-1 overflow-y-auto">
                <DrugHistory
                    doses={Array.isArray(drug.doses) ? drug.doses : []}
                    dosageUnit={drug.settings?.defaultDosage?.unit || drug.dosageUnit || 'mg'}
                />
            </div>
        </MobileModal>
    );
};

export default HistoryDisplay;