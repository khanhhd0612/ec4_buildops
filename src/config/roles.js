const allRoles = {
    // Khách hàng, chủ đầu tư, quan sát viên — chỉ xem, không chỉnh sửa
    viewer: [
        'getProjects',
        'getBOQ',
        'getContracts',
        'getMaterials',
        'getEquipment',
        'getEmployees',
        'getTimesheets',
        'getDocuments',
        'getReports',
    ],

    // Kỹ sư hiện trường — nhập liệu hàng ngày, báo cáo tiến độ
    engineer: [
        'getProjects',
        'updateProgress',       // Cập nhật % hoàn thành WBS hàng ngày
        'getBOQ',

        'getMaterials',
        'manageMaterials',      // Tạo phiếu đề nghị vật tư (PR)

        'getEmployees',
        'getTimesheets',
        'manageTimesheets',     // Chấm công bản thân / tổ đội

        'manageSiteDiary',      // Viết nhật ký thi công hàng ngày
        'getEquipment',
        'manageEquipmentLog',   // Ghi nhận giờ máy hoạt động

        'manageExpenses',       // Tạo phiếu đề xuất thanh toán nhỏ

        'manageRFX',            // Tạo RFI / Issue, thêm comment
        'getDocuments',
        'manageDocuments',      // Upload bản vẽ, ảnh hiện trường

        'getReports',
    ],

    // Thủ kho — quản lý toàn bộ vật tư, nhập/xuất kho
    warehouse: [
        'getProjects',

        'getMaterials',
        'manageMaterials',      // Tạo / cập nhật danh mục vật tư
        'manageInventory',      // Ghi nhận phiếu nhập / xuất kho
        'approveMaterials',     // Xác nhận xuất kho theo phiếu đã duyệt

        'getEmployees',
        'getTimesheets',

        'manageSiteDiary',
        'getEquipment',
        'manageEquipmentLog',

        'manageExpenses',       // Tạo phiếu mua vật tư

        'manageRFX',
        'getDocuments',
        'manageDocuments',

        'getReports',
    ],

    // Kế toán — quản lý tài chính, hợp đồng, chi phí, thanh toán
    accountant: [
        'getProjects',
        'getBOQ',

        'getContracts',
        'manageContracts',      // Soạn thảo hợp đồng, cập nhật thanh toán

        'getMaterials',
        'manageInventory',

        'getCosts',
        'manageCosts',          // Lập kế hoạch ngân sách, điều chỉnh cost
        'manageExpenses',
        'approveExpenses',      // Duyệt phiếu chi / thanh toán

        'getEmployees',
        'getTimesheets',

        'getDocuments',
        'manageDocuments',

        'getReports',
        'exportReports',        // Xuất báo cáo tài chính Excel/PDF
    ],

    // Chỉ huy trưởng — quản lý toàn bộ công trường, duyệt luồng vận hành
    supervisor: [
        'getProjects',
        'manageProjects',       // Cập nhật thông tin dự án
        'manageWBS',            // Tạo / sửa WBS, phân công nhân sự
        'updateProgress',
        'approveProgress',      // Duyệt báo cáo tiến độ của kỹ sư

        'getBOQ',
        'manageBOQ',
        'manageAcceptance',     // Lập biên bản nghiệm thu

        'getContracts',

        'getMaterials',
        'manageMaterials',
        'approveMaterials',     // Duyệt phiếu đề nghị vật tư
        'manageInventory',

        'getCosts',
        'manageExpenses',
        'approveExpenses',      // Duyệt chi phí phát sinh tại công trường

        'getEmployees',
        'manageEmployees',      // Quản lý tổ đội tại dự án
        'getTimesheets',
        'manageTimesheets',
        'approveTimesheets',    // Phê duyệt chấm công tổ đội

        'manageSiteDiary',
        'approveSiteDiary',     // Duyệt nhật ký của kỹ sư

        'getEquipment',
        'manageEquipment',      // Phân công máy/xe vào dự án
        'manageEquipmentLog',

        'manageRFX',
        'approveRFX',           // Đóng / resolve RFX issues

        'getDocuments',
        'manageDocuments',

        'getReports',
        'exportReports',
    ],

    // Quản lý dự án — toàn quyền trên dự án được giao
    pm: [
        'getProjects',
        'manageProjects',
        'manageWBS',
        'updateProgress',
        'approveProgress',

        'getBOQ',
        'manageBOQ',
        'manageAcceptance',
        'approveAcceptance',    // Ký duyệt biên bản nghiệm thu

        'getContracts',
        'manageContracts',
        'approveContracts',     // Ký duyệt hợp đồng

        'getMaterials',
        'manageMaterials',
        'approveMaterials',
        'manageInventory',

        'getCosts',
        'manageCosts',
        'approveCosts',         // Duyệt kế hoạch chi phí
        'manageExpenses',
        'approveExpenses',

        'getEmployees',
        'manageEmployees',
        'getTimesheets',
        'manageTimesheets',
        'approveTimesheets',

        'manageSiteDiary',
        'approveSiteDiary',

        'getEquipment',
        'manageEquipment',
        'manageEquipmentLog',

        'manageRFX',
        'approveRFX',

        'getDocuments',
        'manageDocuments',
        'deleteDocuments',

        'getReports',
        'exportReports',
        'getInsight',
    ],

    // Giám đốc / Ban lãnh đạo — xem toàn bộ, duyệt cấp cao, không nhập liệu
    ceo: [
        'getUsers',

        'getProjects',
        'approveProgress',

        'getBOQ',
        'approveAcceptance',

        'getContracts',
        'approveContracts',

        'getMaterials',
        'approveMaterials',

        'getCosts',
        'approveCosts',
        'approveExpenses',

        'getEmployees',
        'getTimesheets',
        'approveTimesheets',

        'approveSiteDiary',

        'getEquipment',

        'approveRFX',

        'getDocuments',

        'getReports',
        'exportReports',
        'getInsight',
    ],

    // Quản trị hệ thống — toàn quyền
    admin: [
        'manageOrganization',

        'getUsers',
        'manageUsers',

        'getProjects',
        'manageProjects',
        'manageWBS',
        'updateProgress',
        'approveProgress',

        'getBOQ',
        'manageBOQ',
        'manageAcceptance',
        'approveAcceptance',

        'getContracts',
        'manageContracts',
        'approveContracts',

        'getMaterials',
        'manageMaterials',
        'approveMaterials',
        'manageInventory',

        'getCosts',
        'manageCosts',
        'approveCosts',
        'manageExpenses',
        'approveExpenses',

        'getEmployees',
        'manageEmployees',
        'getTimesheets',
        'manageTimesheets',
        'approveTimesheets',

        'manageSiteDiary',
        'approveSiteDiary',

        'getEquipment',
        'manageEquipment',
        'manageEquipmentLog',

        'manageRFX',
        'approveRFX',

        'getDocuments',
        'manageDocuments',
        'deleteDocuments',

        'getReports',
        'exportReports',
        'getInsight',
    ],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
    roles,
    roleRights,
};