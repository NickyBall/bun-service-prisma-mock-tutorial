import type { PrismaClient } from "@prisma/client";

class CustomerService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getAllCustomers() {
    return this.prisma.customer.findMany();
  }

  async getCustomerById(id: number) {
    return this.prisma.customer.findUnique({
      where: { id },
    });
  }

  async createCustomer(name: string) {
    return this.prisma.customer.create({
      data: { name },
    });
  }

  async updateCustomer(id: number, name: string) {
    return this.prisma.customer.update({
      where: { id },
      data: { name },
    });
  }

  async deleteCustomer(id: number) {
    return this.prisma.customer.delete({
      where: { id },
    });
  }
}

export default CustomerService;
