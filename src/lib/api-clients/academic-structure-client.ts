import { API_ENDPOINTS, apiGet, apiPost, apiPut, apiDelete } from '@/config/api';

/**
 * Academic Structure Service Client
 * Handles departments, classes, modules, and subjects
 */
export class AcademicStructureClient {
    // ===== ACADEMIC YEARS =====

    /**
     * Get all academic years
     */
    static async getAllAcademicYears(token: string) {
        return apiGet(API_ENDPOINTS.ACADEMIC_YEARS.BASE, token, true);
    }

    /**
     * Create academic year
     */
    static async createAcademicYear(data: any, token: string) {
        return apiPost(API_ENDPOINTS.ACADEMIC_YEARS.BASE, data, token);
    }

    /**
     * Set active academic year
     */
    static async setActiveAcademicYear(id: number, token: string) {
        return apiPut(API_ENDPOINTS.ACADEMIC_YEARS.SET_ACTIVE(id), {}, token);
    }

    // ===== DEPARTMENTS =====

    /**
     * Get all departments
     */
    static async getAllDepartments(token: string) {
        return apiGet(API_ENDPOINTS.DEPARTMENTS.BASE, token, true);
    }

    /**
     * Get department by ID
     */
    static async getDepartmentById(id: number, token: string) {
        return apiGet(API_ENDPOINTS.DEPARTMENTS.BY_ID(id), token, true);
    }

    /**
     * Create department
     */
    static async createDepartment(departmentData: any, token: string) {
        return apiPost(API_ENDPOINTS.DEPARTMENTS.BASE, departmentData, token);
    }

    /**
     * Update department
     */
    static async updateDepartment(id: number, departmentData: any, token: string) {
        return apiPut(API_ENDPOINTS.DEPARTMENTS.BY_ID(id), departmentData, token);
    }

    /**
     * Delete department
     */
    static async deleteDepartment(id: number, token: string) {
        return apiDelete(API_ENDPOINTS.DEPARTMENTS.BY_ID(id), token);
    }

    // ===== CLASSES (CLASS GROUPS) =====

    /**
     * Get all classes
     */
    static async getAllClasses(token: string) {
        return apiGet(API_ENDPOINTS.CLASSES.BASE, token, true);
    }

    /**
     * Get class by ID
     */
    static async getClassById(id: number, token: string) {
        return apiGet(API_ENDPOINTS.CLASSES.BY_ID(id), token, true);
    }

    /**
     * Get classes by department
     */
    static async getClassesByDepartment(departmentId: number, token: string) {
        return apiGet(API_ENDPOINTS.CLASSES.BY_DEPARTMENT(departmentId), token, true);
    }

    /**
     * Get students in a class
     */
    static async getClassStudents(classId: number, token: string) {
        return apiGet(API_ENDPOINTS.CLASSES.STUDENTS(classId), token, true);
    }

    /**
     * Add student to class
     */
    static async addStudentToClass(classId: number, studentId: number, token: string) {
        return apiPost(API_ENDPOINTS.CLASSES.ADD_STUDENT(classId, studentId), {}, token);
    }

    /**
     * Create class
     */
    static async createClass(classData: any, token: string) {
        return apiPost(API_ENDPOINTS.CLASSES.BASE, classData, token);
    }

    /**
     * Update class
     */
    static async updateClass(id: number, classData: any, token: string) {
        return apiPut(API_ENDPOINTS.CLASSES.BY_ID(id), classData, token);
    }

    /**
     * Delete class
     */
    static async deleteClass(id: number, token: string) {
        return apiDelete(API_ENDPOINTS.CLASSES.BY_ID(id), token);
    }

    // ===== MODULES =====

    /**
     * Get all modules
     */
    static async getAllModules(token: string) {
        return apiGet(API_ENDPOINTS.MODULES.BASE, token, true);
    }

    /**
     * Get module by ID
     */
    static async getModuleById(id: number, token: string) {
        return apiGet(API_ENDPOINTS.MODULES.BY_ID(id), token, true);
    }

    /**
     * Create module
     */
    static async createModule(moduleData: any, token: string) {
        return apiPost(API_ENDPOINTS.MODULES.BASE, moduleData, token);
    }

    /**
     * Update module
     */
    static async updateModule(id: number, moduleData: any, token: string) {
        return apiPut(API_ENDPOINTS.MODULES.BY_ID(id), moduleData, token);
    }

    /**
     * Delete module
     */
    static async deleteModule(id: number, token: string) {
        return apiDelete(API_ENDPOINTS.MODULES.BY_ID(id), token);
    }

    // ===== SUBJECTS =====

    /**
     * Get all subjects
     */
    static async getAllSubjects(token: string) {
        return apiGet(API_ENDPOINTS.SUBJECTS.BASE, token, true);
    }

    /**
     * Get subject by ID
     */
    static async getSubjectById(id: number, token: string) {
        return apiGet(API_ENDPOINTS.SUBJECTS.BY_ID(id), token, true);
    }

    /**
     * Create subject
     */
    static async createSubject(subjectData: any, token: string) {
        return apiPost(API_ENDPOINTS.SUBJECTS.BASE, subjectData, token);
    }

    /**
     * Update subject
     */
    static async updateSubject(id: number, subjectData: any, token: string) {
        return apiPut(API_ENDPOINTS.SUBJECTS.BY_ID(id), subjectData, token);
    }

    /**
     * Delete subject
     */
    static async deleteSubject(id: number, token: string) {
        return apiDelete(API_ENDPOINTS.SUBJECTS.BY_ID(id), token);
    }
}
