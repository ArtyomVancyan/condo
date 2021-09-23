const INN_LENGTH = 10
const DEFAULT_ORGANIZATION_TIMEZONE = 'Europe/Moscow'
const DEFAULT_ROLES = {
    // Administrator role is required for mutation logic
    'Administrator': {
        'name': 'employee.role.Administrator.name',
        'description': 'employee.role.Administrator.description',
        'canManageOrganization': true,
        'canManageEmployees': true,
        'canManageRoles': true,
        'canManageIntegrations': true,
        'canManageProperties': true,
        'canManageTickets': true,
        'canManageContacts': true,
        'canManageTicketComments': true,
        'canManageDivisions': true,
        'canManageMeters': true,
        'canShareTickets': true,
        'canBeAssignedAsResponsible': true,
        'canBeAssignedAsExecutor': true,
    },
    'Dispatcher': {
        'name': 'employee.role.Dispatcher.name',
        'description': 'employee.role.Dispatcher.description',
        'canManageOrganization': false,
        'canManageEmployees': false,
        'canManageRoles': false,
        'canManageIntegrations': false,
        'canManageProperties': true,
        'canManageTickets': true,
        'canManageContacts': true,
        'canManageTicketComments': true,
        'canManageDivisions': false,
        'canShareTickets': true,
        'canManageMeters': true,
        'canBeAssignedAsResponsible': true,
        'canBeAssignedAsExecutor': true,
    },
    'Manager': {
        'name': 'employee.role.Manager.name',
        'description': 'employee.role.Manager.description',
        'canManageOrganization': false,
        'canManageEmployees': false,
        'canManageRoles': false,
        'canManageIntegrations': false,
        'canManageProperties': true,
        'canManageTickets': true,
        'canManageContacts': true,
        'canManageTicketComments': true,
        'canManageDivisions': false,
        'canManageMeters': true,
        'canShareTickets': true,
        'canBeAssignedAsResponsible': true,
        'canBeAssignedAsExecutor': true,
    },
    'Foreman': {
        'name': 'employee.role.Foreman.name',
        'description': 'employee.role.Foreman.description',
        'canManageOrganization': false,
        'canManageEmployees': false,
        'canManageRoles': false,
        'canManageIntegrations': false,
        'canManageProperties': false,
        'canManageTickets': true,
        'canManageContacts': false,
        'canManageTicketComments': true,
        'canManageDivisions': false,
        'canManageMeters': true,
        'canShareTickets': true,
        'canBeAssignedAsResponsible': true,
        'canBeAssignedAsExecutor': true,
    },
    'Technician': {
        'name': 'employee.role.Technician.name',
        'description': 'employee.role.Technician.description',
        'canManageOrganization': false,
        'canManageEmployees': false,
        'canManageRoles': false,
        'canManageIntegrations': false,
        'canManageProperties': false,
        'canManageTickets': true,
        'canManageContacts': false,
        'canManageTicketComments': true,
        'canManageDivisions': false,
        'canManageMeters': false,
        'canShareTickets': true,
        'canBeAssignedAsResponsible': true,
        'canBeAssignedAsExecutor': true,
    },
}
module.exports = {
    INN_LENGTH,
    DEFAULT_ORGANIZATION_TIMEZONE,
    DEFAULT_ROLES,
}
