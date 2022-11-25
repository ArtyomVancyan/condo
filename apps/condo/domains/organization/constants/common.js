const ORGANIZATION_TICKET_VISIBILITY = 'organization'
const PROPERTY_TICKET_VISIBILITY = 'property'
const PROPERTY_AND_SPECIALIZATION_VISIBILITY = 'propertyAndSpecialization'
const ASSIGNED_TICKET_VISIBILITY = 'assigned'
const TICKET_VISIBILITY_OPTIONS = [
    ORGANIZATION_TICKET_VISIBILITY,
    PROPERTY_TICKET_VISIBILITY,
    PROPERTY_AND_SPECIALIZATION_VISIBILITY,
    ASSIGNED_TICKET_VISIBILITY,
]

const TIN_LENGTH = 10
const DEFAULT_ORGANIZATION_TIMEZONE = 'Europe/Moscow'

const ORGANIZATION_NAME_PREFIX_AND_QUOTES_REGEXP = /ООО|"|«|»|“|”|„|‟/ig

const DEFAULT_ROLES = {
    // Administrator role is required for mutation logic
    'Administrator': {
        'name': 'employee.role.Administrator.name',
        'description': 'employee.role.Administrator.description',
        'canManageOrganization': true,
        'canManageEmployees': true,
        'canInviteNewOrganizationEmployees': true,
        'canManageRoles': true,
        'canManageIntegrations': true,
        'canManageProperties': true,
        'canManageTickets': true,
        'canManageContacts': true,
        'canManageContactRoles': true,
        'canManageTicketComments': true,
        'canManageMeters': true,
        'canManageMeterReadings': true,
        'canShareTickets': true,
        'canBeAssignedAsResponsible': true,
        'canBeAssignedAsExecutor': true,
        'canReadPayments': true,
        'canReadBillingReceipts': true,
        'canManageTicketPropertyHints': true,
        'canManagePropertyScopes': true,
        'canManageBankIntegrationContexts': true,
        'canManageBankContractorAccounts': true,
        'canManageBankTransactions': true,
        'ticketVisibilityType': ORGANIZATION_TICKET_VISIBILITY,
    },
    'Dispatcher': {
        'name': 'employee.role.Dispatcher.name',
        'description': 'employee.role.Dispatcher.description',
        'canManageOrganization': false,
        'canManageEmployees': false,
        'canInviteNewOrganizationEmployees': false,
        'canManageRoles': false,
        'canManageIntegrations': false,
        'canManageProperties': true,
        'canManageTickets': true,
        'canManageContacts': true,
        'canManageContactRoles': true,
        'canManageTicketComments': true,
        'canShareTickets': true,
        'canManageMeters': true,
        'canManageMeterReadings': true,
        'canBeAssignedAsResponsible': true,
        'canBeAssignedAsExecutor': true,
        'canReadPayments': true,
        'canReadBillingReceipts': true,
        'canManageTicketPropertyHints': false,
        'canManagePropertyScopes': false,
        'canManageBankIntegrationContexts': false,
        'canManageBankContractorAccounts': false,
        'canManageBankTransactions': false,
        'ticketVisibilityType': PROPERTY_TICKET_VISIBILITY,
    },
    'Manager': {
        'name': 'employee.role.Manager.name',
        'description': 'employee.role.Manager.description',
        'canManageOrganization': false,
        'canManageEmployees': false,
        'canInviteNewOrganizationEmployees': false,
        'canManageRoles': false,
        'canManageIntegrations': false,
        'canManageProperties': true,
        'canManageTickets': true,
        'canManageContacts': true,
        'canManageContactRoles': false,
        'canManageTicketComments': true,
        'canManageMeters': true,
        'canManageMeterReadings': true,
        'canShareTickets': true,
        'canBeAssignedAsResponsible': true,
        'canBeAssignedAsExecutor': true,
        'canReadPayments': true,
        'canReadBillingReceipts': true,
        'canManageTicketPropertyHints': false,
        'canManagePropertyScopes': false,
        'canManageBankIntegrationContexts': false,
        'canManageBankContractorAccounts': false,
        'canManageBankTransactions': false,
        'ticketVisibilityType': PROPERTY_TICKET_VISIBILITY,
    },
    'Foreman': {
        'name': 'employee.role.Foreman.name',
        'description': 'employee.role.Foreman.description',
        'canManageOrganization': false,
        'canManageEmployees': false,
        'canInviteNewOrganizationEmployees': true,
        'canManageRoles': false,
        'canManageIntegrations': false,
        'canManageProperties': false,
        'canManageTickets': true,
        'canManageContacts': true,
        'canManageContactRoles': false,
        'canManageTicketComments': true,
        'canManageMeters': true,
        'canManageMeterReadings': true,
        'canShareTickets': true,
        'canBeAssignedAsResponsible': true,
        'canBeAssignedAsExecutor': true,
        'canReadPayments': false,
        'canReadBillingReceipts': false,
        'canManageTicketPropertyHints': false,
        'canManagePropertyScopes': false,
        'canManageBankIntegrationContexts': false,
        'canManageBankContractorAccounts': false,
        'canManageBankTransactions': false,
        'ticketVisibilityType': PROPERTY_AND_SPECIALIZATION_VISIBILITY,
    },
    'Technician': {
        'name': 'employee.role.Technician.name',
        'description': 'employee.role.Technician.description',
        'canManageOrganization': false,
        'canManageEmployees': false,
        'canInviteNewOrganizationEmployees': false,
        'canManageRoles': false,
        'canManageIntegrations': false,
        'canManageProperties': false,
        'canManageTickets': true,
        'canManageContacts': false,
        'canManageContactRoles': false,
        'canManageTicketComments': true,
        'canManageMeters': true,
        'canManageMeterReadings': true,
        'canShareTickets': true,
        'canBeAssignedAsResponsible': true,
        'canBeAssignedAsExecutor': true,
        'canReadPayments': false,
        'canReadBillingReceipts': false,
        'canManageTicketPropertyHints': false,
        'canManagePropertyScopes': false,
        'canManageBankIntegrationContexts': false,
        'canManageBankContractorAccounts': false,
        'canManageBankTransactions': false,
        'ticketVisibilityType': PROPERTY_AND_SPECIALIZATION_VISIBILITY,
    },
    'Contractor': {
        'name': 'employee.role.Contractor.name',
        'description': 'employee.role.Contractor.description',
        'canManageTickets': true,
        'canManageContacts': false,
        'canShareTickets': true,
        'canManageTicketComments': true,
        'canManageOrganization': false,
        'canManageEmployees': false,
        'canManageRoles': false,
        'canManageIntegrations': false,
        'canManageProperties': false,
        'canManageContactRoles': false,
        'canManageMeters': false,
        'canManageMeterReadings': false,
        'canBeAssignedAsResponsible': true,
        'canBeAssignedAsExecutor': true,
        'canReadPayments': false,
        'canReadBillingReceipts': false,
        'canManageTicketPropertyHints': false,
        'canManagePropertyScopes': false,
        'canManageBankIntegrationContexts': false,
        'canManageBankContractorAccounts': false,
        'canManageBankTransactions': false,
        'ticketVisibilityType': ASSIGNED_TICKET_VISIBILITY,
    },
}

module.exports = {
    TIN_LENGTH,
    DEFAULT_ORGANIZATION_TIMEZONE,
    DEFAULT_ROLES,
    ORGANIZATION_TICKET_VISIBILITY,
    PROPERTY_TICKET_VISIBILITY,
    PROPERTY_AND_SPECIALIZATION_VISIBILITY,
    ASSIGNED_TICKET_VISIBILITY,
    TICKET_VISIBILITY_OPTIONS,
    ORGANIZATION_NAME_PREFIX_AND_QUOTES_REGEXP,
}